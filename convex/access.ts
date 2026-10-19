import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';

import type { Doc, Id } from './_generated/dataModel';
import type { QueryCtx } from './_generated/server';
import { DELETED_ACCOUNT, NOT_SIGNED_IN } from './chatRules';
import { presenceOf } from './presence';

export const requireUserId = async (ctx: QueryCtx): Promise<Id<'users'>> => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
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
