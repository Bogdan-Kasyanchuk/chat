import { v } from 'convex/values';

import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { internalMutation, mutation } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { requireUserId } from './access';
import { ONLINE_TIMEOUT_MS } from './chatRules';

const findRow = async (ctx: QueryCtx, userId: Id<'users'>) => ctx.db
    .query('presence')
    .withIndex('by_user', q => q.eq('userId', userId))
    .unique();

const cancelJob = async (ctx: MutationCtx, jobId: Id<'_scheduled_functions'> | undefined) => {
    if (jobId) {
        await ctx.scheduler.cancel(jobId);
    }
};

export const presenceOf = async (
    ctx: QueryCtx,
    userId: Id<'users'>
): Promise<{ online: boolean, lastSeenAt: number | null }> => {
    const row = await findRow(ctx, userId);

    return row ? { online: row.online, lastSeenAt: row.lastSeenAt } : { online: false, lastSeenAt: null };
};

export const heartbeat = mutation({
    args: {},
    handler: async ctx => {
        const userId = await requireUserId(ctx);
        const row = await findRow(ctx, userId);

        await cancelJob(ctx, row?.expireJobId);

        const expireJobId = await ctx.scheduler.runAfter(ONLINE_TIMEOUT_MS, internal.presence.expire, { userId });
        const patch = { lastSeenAt: Date.now(), online: true, expireJobId };

        if (row) {
            await ctx.db.patch('presence', row._id, patch);
        } else {
            await ctx.db.insert('presence', { userId, ...patch });
        }

        return null;
    }
});

export const disconnect = mutation({
    args: {},
    handler: async ctx => {
        const userId = await requireUserId(ctx);
        const row = await findRow(ctx, userId);

        if (row) {
            await cancelJob(ctx, row.expireJobId);
            await ctx.db.patch('presence', row._id, { lastSeenAt: Date.now(), online: false, expireJobId: undefined });
        }

        return null;
    }
});

export const expire = internalMutation({
    args: { userId: v.id('users') },
    handler: async (ctx, { userId }) => {
        const row = await findRow(ctx, userId);

        if (row) {
            await ctx.db.patch('presence', row._id, { online: false, expireJobId: undefined });
        }

        return null;
    }
});
