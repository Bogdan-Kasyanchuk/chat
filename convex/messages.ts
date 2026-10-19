import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';

import type { Doc, Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { findMember, partnerOf, requireMember, requireUserId, userView } from './access';
import {
    ACCOUNT_DELETED,
    BATCH_SIZE_INVALID,
    CHAT_NOT_FOUND,
    DELETED_MESSAGE,
    DELETE_FOR_EVERYONE_OWN_ONLY,
    FORWARDED_NOT_EDITABLE,
    MAX_BATCH,
    MESSAGE_NOT_FOUND,
    NOT_YOUR_MESSAGE,
    normalizeBody
} from './chatRules';

export type MessageView = {
    id: Id<'messages'>,
    body: string,
    createdAt: number,
    authorIsMe: boolean,
    editedAt: number | null,
    forwardedFrom: string | null,
    replyTo: { id: Id<'messages'> | null, authorName: string, body: string } | null,
    read: boolean
};

type NewMessage = {
    chatId: Id<'chats'>,
    authorId: Id<'users'>,
    body: string,
    replyToId?: Id<'messages'>,
    forwardedFromId?: Id<'users'>
};

// Спільні побічні ефекти надсилання (send, forward): вставка, lastMessageAt, показ чату обом, прочитано для автора
export const insertMessage = async (ctx: MutationCtx, message: NewMessage): Promise<Id<'messages'>> => {
    const mine = await requireMember(ctx, message.chatId, message.authorId);
    const theirs = await partnerOf(ctx, message.chatId, message.authorId);

    if (!theirs) {
        throw new ConvexError(ACCOUNT_DELETED);
    }

    const messageId = await ctx.db.insert('messages', { ...message, hiddenFor: [] });

    // _creationTime має дробову частину, тож «прочитано» беремо з самого повідомлення, а не з Date.now()
    const created = await ctx.db.get('messages', messageId);
    const now = created?._creationTime ?? Date.now();

    await ctx.db.patch('chats', message.chatId, { lastMessageAt: now });
    await ctx.db.patch('chatMembers', mine._id, { hidden: false, lastReadAt: now });

    if (theirs.hidden) {
        await ctx.db.patch('chatMembers', theirs._id, { hidden: false });
    }

    return messageId;
};

const toView = async (
    ctx: QueryCtx,
    message: Doc<'messages'>,
    myId: Id<'users'>,
    partnerReadAt: number
): Promise<MessageView> => {
    const authorIsMe = message.authorId === myId;
    let replyTo: MessageView[ 'replyTo' ] = null;

    if (message.replyToId) {
        const original = await ctx.db.get('messages', message.replyToId);

        replyTo = original
            ? { id: original._id, authorName: (await userView(ctx, original.authorId)).name, body: original.body }
            : { id: null, authorName: '', body: DELETED_MESSAGE };
    }

    return {
        id: message._id,
        body: message.body,
        createdAt: message._creationTime,
        authorIsMe,
        editedAt: message.editedAt ?? null,
        forwardedFrom: message.forwardedFromId ? (await userView(ctx, message.forwardedFromId)).name : null,
        replyTo,
        read: authorIsMe ? partnerReadAt >= message._creationTime : true
    };
};

// chatId з адреси сторінки: зіпсований id — той самий CHAT_NOT_FOUND, що й чужий чат
export const list = query({
    args: { chatId: v.string(), paginationOpts: paginationOptsValidator },
    handler: async (ctx, { paginationOpts, ...args }) => {
        const myId = await requireUserId(ctx);
        const chatId = ctx.db.normalizeId('chats', args.chatId);

        if (!chatId) {
            throw new ConvexError(CHAT_NOT_FOUND);
        }

        const mine = await requireMember(ctx, chatId, myId);
        const partner = await partnerOf(ctx, chatId, myId);
        const result = await ctx.db
            .query('messages')
            .withIndex('by_chat', q => q.eq('chatId', chatId).gt('_creationTime', mine.clearedAt))
            .order('desc')
            .paginate(paginationOpts);
        // Сторінка може вийти коротшою за numItems — це прийнято
        const visible = result.page.filter(message => !message.hiddenFor.includes(myId));
        const page = await Promise.all(visible.map(async message => toView(ctx, message, myId, partner?.lastReadAt ?? 0)));

        return { ...result, page };
    }
});

export const send = mutation({
    args: { chatId: v.id('chats'), body: v.string(), replyToId: v.optional(v.id('messages')) },
    handler: async (ctx, { chatId, body, replyToId }) => {
        const myId = await requireUserId(ctx);
        await requireMember(ctx, chatId, myId);

        const text = normalizeBody(body);

        if (replyToId) {
            const original = await ctx.db.get('messages', replyToId);

            if (original?.chatId !== chatId) {
                throw new ConvexError(MESSAGE_NOT_FOUND);
            }
        }

        return insertMessage(ctx, { chatId, authorId: myId, body: text, replyToId });
    }
});

// Повідомлення, яке я бачу: існує, чат мій і не прихований, не приховане для мене, не раніше за clearedAt
const requireVisibleMessage = async (ctx: QueryCtx, messageId: Id<'messages'>, myId: Id<'users'>): Promise<Doc<'messages'>> => {
    const message = await ctx.db.get('messages', messageId);

    if (!message || message.hiddenFor.includes(myId)) {
        throw new ConvexError(MESSAGE_NOT_FOUND);
    }

    const member = await findMember(ctx, message.chatId, myId);

    if (!member || member.hidden || message._creationTime <= member.clearedAt) {
        throw new ConvexError(MESSAGE_NOT_FOUND);
    }

    return message;
};

// Перевіряє розмір вибірки, прибирає дублі й віддає видимі повідомлення в порядку створення
const requireSelection = async (ctx: QueryCtx, ids: Id<'messages'>[], myId: Id<'users'>): Promise<Doc<'messages'>[]> => {
    if (ids.length < 1 || ids.length > MAX_BATCH) {
        throw new ConvexError(BATCH_SIZE_INVALID);
    }

    const messages = await Promise.all([ ...new Set(ids) ].map(async id => requireVisibleMessage(ctx, id, myId)));

    return messages.sort((a, b) => a._creationTime - b._creationTime);
};

export const edit = mutation({
    args: { messageId: v.id('messages'), body: v.string() },
    handler: async (ctx, { messageId, body }) => {
        const myId = await requireUserId(ctx);
        const message = await requireVisibleMessage(ctx, messageId, myId);

        if (message.authorId !== myId) {
            throw new ConvexError(NOT_YOUR_MESSAGE);
        }

        if (message.forwardedFromId) {
            throw new ConvexError(FORWARDED_NOT_EDITABLE);
        }

        await ctx.db.patch('messages', messageId, { body: normalizeBody(body), editedAt: Date.now() });

        return null;
    }
});

// Усе або нічого: спершу перевірка всієї вибірки, потім записи
export const remove = mutation({
    args: { messageIds: v.array(v.id('messages')), forEveryone: v.boolean() },
    handler: async (ctx, { messageIds, forEveryone }) => {
        const myId = await requireUserId(ctx);
        const messages = await requireSelection(ctx, messageIds, myId);

        if (new Set(messages.map(message => message.chatId)).size > 1) {
            throw new ConvexError(MESSAGE_NOT_FOUND);
        }

        if (forEveryone && messages.some(message => message.authorId !== myId)) {
            throw new ConvexError(DELETE_FOR_EVERYONE_OWN_ONLY);
        }

        for (const message of messages) {
            if (forEveryone) {
                await ctx.db.delete('messages', message._id);
            } else {
                await ctx.db.patch('messages', message._id, { hiddenFor: [ ...message.hiddenFor, myId ] });
            }
        }

        return null;
    }
});

export const forward = mutation({
    args: { messageIds: v.array(v.id('messages')), toChatId: v.id('chats') },
    handler: async (ctx, { messageIds, toChatId }) => {
        const myId = await requireUserId(ctx);

        await requireMember(ctx, toChatId, myId);

        const messages = await requireSelection(ctx, messageIds, myId);

        // Помилка посеред циклу (наприклад, ACCOUNT_DELETED) відкочує всю мутацію
        for (const message of messages) {
            await insertMessage(ctx, {
                chatId: toChatId,
                authorId: myId,
                body: message.body,
                forwardedFromId: message.forwardedFromId ?? message.authorId
            });
        }

        return null;
    }
});
