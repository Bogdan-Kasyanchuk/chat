import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';

import type { Doc, Id } from './_generated/dataModel';
import type { QueryCtx } from './_generated/server';
import { CHAT_NOT_FOUND, DELETED_ACCOUNT, NOT_SIGNED_IN } from './chatRules';
import { presenceOf } from './presence';

export const requireUserId = async (ctx: QueryCtx): Promise<Id<'users'>> => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
        throw new ConvexError(NOT_SIGNED_IN);
    }

    // JWT живе до закінчення терміну, а акаунт могли видалити: токен видаленого користувача нічого не дає
    if (!await ctx.db.get('users', userId)) {
        throw new ConvexError(NOT_SIGNED_IN);
    }

    return userId;
};

// Завантажений аватар важливіший за картинку від Google
export const avatarUrl = async (ctx: QueryCtx, user: Doc<'users'>): Promise<string | null> => {
    if (user.avatarId) {
        return ctx.storage.getUrl(user.avatarId);
    }

    return user.image ?? null;
};

export type UserView = {
    userId: Id<'users'> | null,
    name: string,
    avatar: string | null,
    online: boolean,
    lastSeenAt: number | null
};

// Працює й для видаленого акаунта: документа users уже немає
export const userView = async (ctx: QueryCtx, userId: Id<'users'>): Promise<UserView> => {
    const user = await ctx.db.get('users', userId);

    if (!user) {
        return { userId: null, name: DELETED_ACCOUNT, avatar: null, online: false, lastSeenAt: null };
    }

    return {
        userId,
        name: user.name ?? '',
        avatar: await avatarUrl(ctx, user),
        ...await presenceOf(ctx, userId)
    };
};

// Співрозмовник береться з pairKey, а не з chatMembers: після видалення акаунта його рядків уже немає
export const partnerIdOf = (chat: Doc<'chats'>, userId: Id<'users'>): Id<'users'> => {
    const partnerId = chat.pairKey.split('|').find(id => id !== userId);

    return partnerId as Id<'users'>;
};

export const findMember = async (ctx: QueryCtx, chatId: Id<'chats'>, userId: Id<'users'>) => ctx.db
    .query('chatMembers')
    .withIndex('by_chat', q => q.eq('chatId', chatId).eq('userId', userId))
    .unique();

// Учасник, чий рядок не прихований. Чужий чат виглядає як неіснуючий
export const requireMember = async (ctx: QueryCtx, chatId: Id<'chats'>, userId: Id<'users'>): Promise<Doc<'chatMembers'>> => {
    const member = await findMember(ctx, chatId, userId);

    if (!member || member.hidden) {
        throw new ConvexError(CHAT_NOT_FOUND);
    }

    return member;
};

// Рядок співрозмовника в chatMembers; null, якщо його акаунт видалено
export const partnerOf = async (ctx: QueryCtx, chatId: Id<'chats'>, userId: Id<'users'>): Promise<Doc<'chatMembers'> | null> => {
    const chat = await ctx.db.get('chats', chatId);

    if (!chat) {
        return null;
    }

    return findMember(ctx, chatId, partnerIdOf(chat, userId));
};

// Мітка «прочитано/очищено до цього моменту». _creationTime має дробову частину, тож без max
// повідомлення з тієї самої мілісекунди, що й Date.now(), лишилось би по інший бік мітки
export const readMark = async (ctx: QueryCtx, chatId: Id<'chats'>): Promise<number> => {
    const latest = await ctx.db
        .query('messages')
        .withIndex('by_chat', q => q.eq('chatId', chatId))
        .order('desc')
        .first();

    return Math.max(Date.now(), latest?._creationTime ?? 0);
};
