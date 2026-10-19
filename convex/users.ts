import { v } from 'convex/values';

import { internalQuery, query } from './_generated/server';
import { avatarUrl, requireUserId } from './access';
import type { EmailStatus } from './authRules';
import { DEFAULT_SOUND } from './chatRules';

export const me = query({
    args: {},
    handler: async ctx => {
        const userId = await requireUserId(ctx).catch(() => null);

        if (userId === null) {
            return null;
        }

        const user = await ctx.db.get('users', userId);

        if (!user) {
            return null;
        }

        return {
            id: user._id,
            name: user.name ?? '',
            email: user.email ?? '',
            avatar: await avatarUrl(ctx, user),
            sound: user.sound ?? DEFAULT_SOUND
        };
    }
});

// Лише для провайдера пошти: публічного «чи зайнята пошта» немає, щоб адреси не можна було перебирати.
// Пошта в users не унікальна, тож шукаємо серед усіх збігів: якщо хоч в одного є акаунт з паролем — 'password'
export const emailStatus = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, { email }): Promise<EmailStatus> => {
        const account = await ctx.db
            .query('authAccounts')
            .withIndex('providerAndAccountId', q => q.eq('provider', 'password').eq('providerAccountId', email))
            .first();

        if (account) {
            return 'password';
        }

        const user = await ctx.db
            .query('users')
            .withIndex('email', q => q.eq('email', email))
            .first();

        return user ? 'google' : 'free';
    }
});
