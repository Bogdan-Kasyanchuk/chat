import { ConvexError, v } from 'convex/values';

import { mutation } from './_generated/server';
import { requireUserId } from './access';
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
