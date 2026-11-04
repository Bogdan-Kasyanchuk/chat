import { ConvexError, v } from 'convex/values';

import { internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import { internalMutation, mutation, query } from './_generated/server';
import type { QueryCtx } from './_generated/server';
import { findMember, partnerIdOf, partnerOf, readMark, requireMember, requireUserId, userView } from './access';
import type { UserView } from './access';
import { CANNOT_ADD_SELF, DELETE_BATCH, USER_NOT_FOUND, pairKey } from './chatRules';

const newMember = { lastReadAt: 0, clearedAt: 0, muted: false };

// Знаходить чат пари або створює його. Співрозмовник побачить чат у списку лише з першим повідомленням
export const open = mutation({
    args: { userId: v.id('users') },
    handler: async (ctx, { userId }) => {
        const myId = await requireUserId(ctx);

        if (userId === myId) {
            throw new ConvexError(CANNOT_ADD_SELF);
        }

        if (!await ctx.db.get('users', userId)) {
            throw new ConvexError(USER_NOT_FOUND);
        }

        const key = pairKey(myId, userId);
        const existing = await ctx.db
            .query('chats')
            .withIndex('by_pair', q => q.eq('pairKey', key))
            .unique();
        const chatId = existing?._id ?? await ctx.db.insert('chats', { pairKey: key, lastMessageAt: 0 });
        const mine = await ctx.db
            .query('chatMembers')
            .withIndex('by_chat', q => q.eq('chatId', chatId).eq('userId', myId))
            .unique();

        if (!mine) {
            await ctx.db.insert('chatMembers', { chatId, userId: myId, ...newMember, hidden: false });
        } else if (mine.hidden) {
            await ctx.db.patch('chatMembers', mine._id, { hidden: false });
        }

        const theirs = await ctx.db
            .query('chatMembers')
            .withIndex('by_chat', q => q.eq('chatId', chatId).eq('userId', userId))
            .unique();

        if (!theirs) {
            await ctx.db.insert('chatMembers', { chatId, userId, ...newMember, hidden: true });
        }

        return chatId;
    }
});

const UNREAD_LIMIT = 100;

export type ChatPartner = UserView & { isContact: boolean };

const partnerView = async (ctx: QueryCtx, myId: Id<'users'>, partnerId: Id<'users'>): Promise<ChatPartner> => {
    const contact = await ctx.db
        .query('contacts')
        .withIndex('by_owner', q => q.eq('ownerId', myId).eq('contactId', partnerId))
        .unique();

    return { ...await userView(ctx, partnerId), isContact: contact !== null };
};

const summarize = async (ctx: QueryCtx, myId: Id<'users'>, chat: Doc<'chats'>, mine: Doc<'chatMembers'>) => {
    const partnerId = partnerIdOf(chat, myId);
    const theirs = await partnerOf(ctx, chat._id, myId);
    const partnerReadAt = theirs?.lastReadAt ?? 0;
    let lastMessage: {
        id: Id<'messages'>,
        body: string,
        authorIsMe: boolean,
        createdAt: number,
        read: boolean
    } | null = null;
    let unread = 0;
    const unreadAfter = Math.max(mine.lastReadAt, mine.clearedAt);

    // Спускаємось від нових до старих: зупиняємось, коли знайшли останнє й вийшли за межі непрочитаних
    for await (const message of ctx.db
        .query('messages')
        .withIndex('by_chat', q => q.eq('chatId', chat._id).gt('_creationTime', mine.clearedAt))
        .order('desc')) {
        if (message.hiddenFor.includes(myId)) {
            continue;
        }

        const authorIsMe = message.authorId === myId;

        if (!lastMessage) {
            lastMessage = {
                id: message._id,
                body: message.body,
                authorIsMe,
                createdAt: message._creationTime,
                read: authorIsMe ? partnerReadAt >= message._creationTime : true
            };
        }

        if (message._creationTime <= unreadAfter) {
            break;
        }

        if (!authorIsMe && ++unread >= UNREAD_LIMIT) {
            break;
        }
    }

    return {
        chatId: chat._id,
        partner: await partnerView(ctx, myId, partnerId),
        lastMessage,
        unread,
        muted: mine.muted,
        lastMessageAt: chat.lastMessageAt
    };
};

export const list = query({
    args: {},
    handler: async ctx => {
        const myId = await requireUserId(ctx);
        const members = await ctx.db
            .query('chatMembers')
            .withIndex('by_user', q => q.eq('userId', myId))
            .collect();
        const summaries = await Promise.all(members.filter(member => !member.hidden).map(async member => {
            const chat = await ctx.db.get('chats', member.chatId);

            return chat ? summarize(ctx, myId, chat, member) : null;
        }));

        return summaries
            .filter(summary => summary !== null)
            .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    }
});

// chatId приходить з адреси сторінки: рядок, а не v.id, щоб зіпсована адреса давала null, а не помилку валідатора
export const get = query({
    args: { chatId: v.string() },
    handler: async (ctx, args) => {
        const myId = await requireUserId(ctx);
        const chatId = ctx.db.normalizeId('chats', args.chatId);
        const chat = chatId && await ctx.db.get('chats', chatId);

        if (!chatId || !chat) {
            return null;
        }

        const mine = await findMember(ctx, chatId, myId);

        if (!mine || mine.hidden) {
            return null;
        }

        return {
            chatId,
            partner: await partnerView(ctx, myId, partnerIdOf(chat, myId)),
            muted: mine.muted,
            lastReadAt: mine.lastReadAt,
            canSend: await partnerOf(ctx, chatId, myId) !== null
        };
    }
});

export const markRead = mutation({
    args: { chatId: v.id('chats') },
    handler: async (ctx, { chatId }) => {
        const myId = await requireUserId(ctx);
        const mine = await requireMember(ctx, chatId, myId);

        await ctx.db.patch('chatMembers', mine._id, { lastReadAt: await readMark(ctx, chatId) });

        return null;
    }
});

export const setMuted = mutation({
    args: { chatId: v.id('chats'), muted: v.boolean() },
    handler: async (ctx, { chatId, muted }) => {
        const mine = await requireMember(ctx, chatId, await requireUserId(ctx));

        await ctx.db.patch('chatMembers', mine._id, { muted });

        return null;
    }
});

export const clearHistory = mutation({
    args: { chatId: v.id('chats'), forEveryone: v.boolean() },
    handler: async (ctx, { chatId, forEveryone }) => {
        const mine = await requireMember(ctx, chatId, await requireUserId(ctx));
        const before = await readMark(ctx, chatId);

        if (forEveryone) {
            await ctx.scheduler.runAfter(0, internal.chats.deleteMessagesBatch, { chatId, deleteChat: false, before });
        } else {
            await ctx.db.patch('chatMembers', mine._id, { clearedAt: before });
        }

        return null;
    }
});

export const remove = mutation({
    args: { chatId: v.id('chats'), forEveryone: v.boolean() },
    handler: async (ctx, { chatId, forEveryone }) => {
        const mine = await requireMember(ctx, chatId, await requireUserId(ctx));
        const before = await readMark(ctx, chatId);

        if (!forEveryone) {
            await ctx.db.patch('chatMembers', mine._id, { hidden: true, clearedAt: before });

            return null;
        }

        const theirs = await partnerOf(ctx, chatId, mine.userId);

        // clearedAt — на випадок, якщо чат знову відкриють до кінця видалення: старі повідомлення вже не видно
        await ctx.db.patch('chatMembers', mine._id, { hidden: true, clearedAt: before });

        if (theirs) {
            await ctx.db.patch('chatMembers', theirs._id, { hidden: true, clearedAt: before });
        }

        await ctx.scheduler.runAfter(0, internal.chats.deleteMessagesBatch, { chatId, deleteChat: true, before });

        return null;
    }
});

// Видаляє повідомлення не новіші за before порціями по DELETE_BATCH. Нові, надіслані під час видалення, лишаються.
// Видалення чату наприкінці прибирає й чат: якщо його ніхто не відкрив знову — разом з усім, що лишилось;
// якщо хтось відкрив (рядок учасника вже не прихований) — чат живий і лишається з новими повідомленнями.
// Викликається й з каскаду видалення акаунта
export const deleteMessagesBatch = internalMutation({
    args: { chatId: v.id('chats'), deleteChat: v.boolean(), before: v.number() },
    handler: async (ctx, { chatId, deleteChat, before }) => {
        const batch = await ctx.db
            .query('messages')
            .withIndex('by_chat', q => q.eq('chatId', chatId).lte('_creationTime', before))
            .take(DELETE_BATCH);

        for (const message of batch) {
            await ctx.db.delete('messages', message._id);
        }

        if (batch.length === DELETE_BATCH) {
            await ctx.scheduler.runAfter(0, internal.chats.deleteMessagesBatch, { chatId, deleteChat, before });

            return null;
        }

        if (!deleteChat) {
            return null;
        }

        const members = await ctx.db
            .query('chatMembers')
            .withIndex('by_chat', q => q.eq('chatId', chatId))
            .collect();

        if (members.some(member => !member.hidden)) {
            return null;
        }

        // Ніхто не повернувся: усе, що надійшло після before, теж іде разом із чатом
        for await (const message of ctx.db.query('messages').withIndex('by_chat', q => q.eq('chatId', chatId))) {
            await ctx.db.delete('messages', message._id);
        }

        for (const member of members) {
            await ctx.db.delete('chatMembers', member._id);
        }

        if (await ctx.db.get('chats', chatId)) {
            await ctx.db.delete('chats', chatId);
        }

        return null;
    }
});
