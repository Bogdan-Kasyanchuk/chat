import { expect, test } from 'vitest';

import { internal } from './_generated/api';
import { setup } from './test.setup';

test('deleteE2eUsers deletes only @e2e.test users', async () => {
    const t = setup();
    const { e2e, real } = await t.run(async ctx => {
        const e2e = await ctx.db.insert('users', { name: 'E2E', email: 'e2e-1@e2e.test' });
        const real = await ctx.db.insert('users', { name: 'Real', email: 'real@example.com' });
        const sessionId = await ctx.db.insert('authSessions', { userId: e2e, expirationTime: Date.now() + 1000 });

        await ctx.db.insert('authRefreshTokens', { sessionId, expirationTime: Date.now() + 1000 });
        await ctx.db.insert('authAccounts', { userId: e2e, provider: 'password', providerAccountId: 'e2e-1@e2e.test' });

        return { e2e, real };
    });

    expect(await t.mutation(internal.testing.deleteE2eUsers, {})).toBe(1);

    const left = await t.run(async ctx => ({
        e2e: await ctx.db.get('users', e2e),
        real: await ctx.db.get('users', real),
        sessions: await ctx.db.query('authSessions').collect(),
        tokens: await ctx.db.query('authRefreshTokens').collect(),
        accounts: await ctx.db.query('authAccounts').collect()
    }));

    expect(left.e2e).toBeNull();
    expect(left.real).not.toBeNull();
    expect(left.sessions).toEqual([]);
    expect(left.tokens).toEqual([]);
    expect(left.accounts).toEqual([]);
});
