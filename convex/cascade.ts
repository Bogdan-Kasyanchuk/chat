import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';
import { readMark } from './access';

// Каскад видалення акаунта. Повідомлення автора лишаються в чаті співрозмовника (він бачить «Deleted account»);
// чат, у якому нікого не лишилось, видаляється разом із повідомленнями у фоні
export const deleteUserCascade = async (ctx: MutationCtx, userId: Id<'users'>): Promise<void> => {
    const owned = await ctx.db.query('contacts').withIndex('by_owner', q => q.eq('ownerId', userId)).collect();
    const pointing = await ctx.db.query('contacts').withIndex('by_contact', q => q.eq('contactId', userId)).collect();

    for (const contact of [ ...owned, ...pointing ]) {
        await ctx.db.delete('contacts', contact._id);
    }

    const memberships = await ctx.db.query('chatMembers').withIndex('by_user', q => q.eq('userId', userId)).collect();

    for (const membership of memberships) {
        await ctx.db.delete('chatMembers', membership._id);

        const left = await ctx.db.query('chatMembers').withIndex('by_chat', q => q.eq('chatId', membership.chatId)).first();

        if (!left) {
            await ctx.scheduler.runAfter(0, internal.chats.deleteMessagesBatch, {
                chatId: membership.chatId,
                deleteChat: true,
                before: await readMark(ctx, membership.chatId)
            });
        }
    }

    const presence = await ctx.db.query('presence').withIndex('by_user', q => q.eq('userId', userId)).unique();

    if (presence) {
        if (presence.expireJobId) {
            await ctx.scheduler.cancel(presence.expireJobId);
        }

        await ctx.db.delete('presence', presence._id);
    }

    const user = await ctx.db.get('users', userId);

    if (user?.avatarId) {
        await ctx.storage.delete(user.avatarId);
    }

    const accounts = await ctx.db.query('authAccounts').withIndex('userIdAndProvider', q => q.eq('userId', userId)).collect();

    for (const account of accounts) {
        const codes = await ctx.db.query('authVerificationCodes').withIndex('accountId', q => q.eq('accountId', account._id)).collect();

        for (const code of codes) {
            await ctx.db.delete('authVerificationCodes', code._id);
        }

        await ctx.db.delete('authAccounts', account._id);
    }

    const sessions = await ctx.db.query('authSessions').withIndex('userId', q => q.eq('userId', userId)).collect();
    const sessionIds = new Set(sessions.map(session => session._id));

    for (const session of sessions) {
        const tokens = await ctx.db.query('authRefreshTokens').withIndex('sessionId', q => q.eq('sessionId', session._id)).collect();

        for (const token of tokens) {
            await ctx.db.delete('authRefreshTokens', token._id);
        }

        await ctx.db.delete('authSessions', session._id);
    }

    // У authVerifiers немає індексу за sessionId, тож перебираємо таблицю (PKCE-верифікатори короткоживучі, їх мало)
    for await (const verifier of ctx.db.query('authVerifiers')) {
        if (verifier.sessionId && sessionIds.has(verifier.sessionId)) {
            await ctx.db.delete('authVerifiers', verifier._id);
        }
    }

    if (user) {
        await ctx.db.delete('users', userId);
    }
};
