import { expect, test } from 'vitest';

import { api, internal } from './_generated/api';
import { createOrUpdateUser } from './auth';
import { asUser, setup } from './test.setup';

test('me returns null for an anonymous visitor', async () => {
    const t = setup();

    expect(await t.query(api.users.me, {})).toBeNull();
});

test('me returns the profile with the default sound', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');

    expect(await alice.client.query(api.users.me, {})).toEqual({
        id: alice.userId,
        name: 'Alice',
        email: 'alice@example.com',
        avatar: 'https://example.com/Alice.png',
        sound: 'classic'
    });
});

test('me prefers the uploaded avatar over the provider image', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const url = await t.run(async ctx => {
        const avatarId = await ctx.storage.store(new Blob([ 'x' ]));

        await ctx.db.patch('users', alice.userId, { avatarId });

        return ctx.storage.getUrl(avatarId);
    });

    expect(url).not.toBeNull();
    expect((await alice.client.query(api.users.me, {}))?.avatar).toBe(url);
});

// Review Focus 1
test('signing in again through Google keeps the edited name and avatar', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');

    await t.run(async ctx => {
        await ctx.db.patch('users', alice.userId, { name: 'Edited' });
    });

    const result = await t.run(async ctx => createOrUpdateUser(ctx, {
        existingUserId: alice.userId,
        type: 'oauth',
        provider: { id: 'google', type: 'oidc' } as never,
        profile: { name: 'Google Name', image: 'g.png' }
    }));
    const user = await t.run(async ctx => ctx.db.get('users', alice.userId));

    expect(result).toBe(alice.userId);
    expect(user?.name).toBe('Edited');
    expect(user?.image).toBe('https://example.com/Alice.png');
});

test('a first Google sign-in creates the user from the profile', async () => {
    const t = setup();
    const userId = await t.run(async ctx => createOrUpdateUser(ctx, {
        existingUserId: null,
        type: 'oauth',
        provider: { id: 'google', type: 'oidc' } as never,
        profile: { name: 'Bob', email: 'bob@example.com', image: 'b.png', extra: 1 }
    }));
    const user = await t.run(async ctx => ctx.db.get('users', userId));

    expect(user).toMatchObject({ name: 'Bob', email: 'bob@example.com', image: 'b.png' });
});

test('a fresh email is free', async () => {
    const t = setup();

    expect(await t.query(internal.users.emailStatus, { email: 'nobody@example.com' })).toBe('free');
});

test('an email with a password account is taken', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');

    await t.run(async ctx => {
        await ctx.db.insert('authAccounts', {
            userId: alice.userId,
            provider: 'password',
            providerAccountId: 'alice@example.com',
            secret: 'hash'
        });
    });

    expect(await t.query(internal.users.emailStatus, { email: 'alice@example.com' })).toBe('password');
});

test('an email known only from Google sign-in points to Google', async () => {
    const t = setup();

    await asUser(t, 'Alice');

    expect(await t.query(internal.users.emailStatus, { email: 'alice@example.com' })).toBe('google');
});

test('duplicate users with one email do not break emailStatus', async () => {
    const t = setup();

    await asUser(t, 'Alice');
    await t.run(async ctx => ctx.db.insert('users', { name: 'Alice 2', email: 'alice@example.com' }));

    expect(await t.query(internal.users.emailStatus, { email: 'alice@example.com' })).toBe('google');
});
