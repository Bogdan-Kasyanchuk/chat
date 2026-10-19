import { ConvexError, v } from 'convex/values';

import type { Doc, Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import type { QueryCtx } from './_generated/server';
import { partnerIdOf, partnerOf, requireMember, requireUserId, userView } from './access';
import type { UserView } from './access';
import { CANNOT_ADD_SELF, USER_NOT_FOUND, pairKey } from './chatRules';

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

export const get = query({
    args: { chatId: v.id('chats') },
    handler: async (ctx, { chatId }) => {
        const myId = await requireUserId(ctx);
        const chat = await ctx.db.get('chats', chatId);

        if (!chat) {
            return null;
        }

        const mine = await requireMember(ctx, chatId, myId).catch(() => null);

        if (!mine) {
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

        // _creationTime має дробову частину: без max повідомлення з цієї ж мілісекунди лишилось би непрочитаним
        const latest = await ctx.db
            .query('messages')
            .withIndex('by_chat', q => q.eq('chatId', chatId))
            .order('desc')
            .first();

        await ctx.db.patch('chatMembers', mine._id, { lastReadAt: Math.max(Date.now(), latest?._creationTime ?? 0) });

        return null;
    }
});
