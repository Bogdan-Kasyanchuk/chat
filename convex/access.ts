import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';

import type { Doc, Id } from './_generated/dataModel';
import type { QueryCtx } from './_generated/server';
import { NOT_SIGNED_IN } from './chatRules';

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
