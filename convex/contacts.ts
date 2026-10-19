import { ConvexError, v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import type { QueryCtx } from './_generated/server';
import { requireUserId, userView } from './access';
import { CANNOT_ADD_SELF, USER_NOT_FOUND, pairKey } from './chatRules';

const findContact = async (ctx: QueryCtx, ownerId: Id<'users'>, contactId: Id<'users'>) => ctx.db
    .query('contacts')
    .withIndex('by_owner', q => q.eq('ownerId', ownerId).eq('contactId', contactId))
    .unique();

export const list = query({
    args: {},
    handler: async ctx => {
        const myId = await requireUserId(ctx);
        const rows = await ctx.db
            .query('contacts')
            .withIndex('by_owner', q => q.eq('ownerId', myId))
            .collect();
        const items = await Promise.all(rows.map(async row => {
            const view = await userView(ctx, row.contactId);
            const chat = await ctx.db
                .query('chats')
                .withIndex('by_pair', q => q.eq('pairKey', pairKey(myId, row.contactId)))
                .unique();

            return { ...view, chatId: chat?._id ?? null };
        }));

        return items.sort((a, b) => a.name.localeCompare(b.name));
    }
});

export const add = mutation({
    args: { userId: v.id('users') },
    handler: async (ctx, { userId }) => {
        const myId = await requireUserId(ctx);

        if (userId === myId) {
            throw new ConvexError(CANNOT_ADD_SELF);
        }

        if (!await ctx.db.get('users', userId)) {
            throw new ConvexError(USER_NOT_FOUND);
        }

        if (!await findContact(ctx, myId, userId)) {
            await ctx.db.insert('contacts', { ownerId: myId, contactId: userId });
        }

        return null;
    }
});

export const remove = mutation({
    args: { userId: v.id('users') },
    handler: async (ctx, { userId }) => {
        const myId = await requireUserId(ctx);
        const row = await findContact(ctx, myId, userId);

        if (row) {
            await ctx.db.delete('contacts', row._id);
        }

        return null;
    }
});
