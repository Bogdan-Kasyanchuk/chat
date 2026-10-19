import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';

import type { Doc, Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { partnerOf, requireMember, requireUserId, userView } from './access';
import { ACCOUNT_DELETED, DELETED_MESSAGE, MESSAGE_NOT_FOUND, normalizeBody } from './chatRules';

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

export const list = query({
    args: { chatId: v.id('chats'), paginationOpts: paginationOptsValidator },
    handler: async (ctx, { chatId, paginationOpts }) => {
        const myId = await requireUserId(ctx);
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
