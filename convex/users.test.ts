import { afterEach, expect, test, vi } from 'vitest';

import { api, internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { createOrUpdateUser } from './auth';
import { ACCOUNT_DELETED, AVATAR_NOT_FOUND, AVATAR_TOO_BIG, AVATAR_TYPE, MAX_AVATAR_BYTES, NOT_SIGNED_IN } from './chatRules';
import { asUser, setup } from './test.setup';

afterEach(() => {
    vi.useRealTimers();
});

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

test('findByEmail finds a user by exact email, case-insensitive', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');

    expect(await alice.client.query(api.users.findByEmail, { email: ' Bob@Example.com ' })).toEqual({
        userId: bob.userId,
        name: 'Bob',
        avatar: 'https://example.com/Bob.png',
        isContact: false
    });
});

test('findByEmail returns null for yourself and for unknown emails', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');

    expect(await alice.client.query(api.users.findByEmail, { email: 'alice@example.com' })).toBeNull();
    expect(await alice.client.query(api.users.findByEmail, { email: 'nobody@example.com' })).toBeNull();
});

test('findByEmail rejects an invalid email and an anonymous visitor', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');

    await expect(alice.client.query(api.users.findByEmail, { email: 'nope' })).rejects.toThrow('Enter a valid email');
    await expect(t.query(api.users.findByEmail, { email: 'bob@example.com' })).rejects.toThrow(NOT_SIGNED_IN);
});

test('findByEmail takes the oldest account when emails repeat and reports isContact', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');

    await t.run(async ctx => ctx.db.insert('users', { name: 'Bob 2', email: 'bob@example.com' }));
    await alice.client.mutation(api.contacts.add, { userId: bob.userId });

    expect(await alice.client.query(api.users.findByEmail, { email: 'bob@example.com' })).toMatchObject({
        userId: bob.userId,
        isContact: true
    });
});

test('updateName trims and validates', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');

    await alice.client.mutation(api.users.updateName, { name: '  Al  ' });

    expect((await alice.client.query(api.users.me, {}))?.name).toBe('Al');
    await expect(alice.client.mutation(api.users.updateName, { name: '   ' })).rejects.toThrow('Name is required');
    await expect(t.mutation(api.users.updateName, { name: 'Al' })).rejects.toThrow(NOT_SIGNED_IN);
});

// convex-test не записує contentType у метадані _storage, тож дописуємо його вручну
const storeFile = async (t: ReturnType<typeof setup>, type: string, size = 1) => t.run(async ctx => {
    const id = await ctx.storage.store(new Blob([ new Uint8Array(size) ], { type }));

    await ctx.db.patch('_storage' as never, id as never, { contentType: type } as never);

    return id;
});

const fileExists = async (t: ReturnType<typeof setup>, storageId: Id<'_storage'>) => t.run(async ctx => await ctx.db.system.get('_storage', storageId) !== null);

test('generateAvatarUploadUrl returns a URL for a signed-in user only', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');

    expect(typeof await alice.client.mutation(api.users.generateAvatarUploadUrl, {})).toBe('string');
    await expect(t.mutation(api.users.generateAvatarUploadUrl, {})).rejects.toThrow(NOT_SIGNED_IN);
});

test('setAvatar replaces and deletes the previous file', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const first = await storeFile(t, 'image/png');
    const second = await storeFile(t, 'image/webp');

    await alice.client.action(api.users.setAvatar, { storageId: first });
    await alice.client.action(api.users.setAvatar, { storageId: second });

    const url = await t.run(async ctx => ctx.storage.getUrl(second));

    expect((await alice.client.query(api.users.me, {}))?.avatar).toBe(url);
    expect(await fileExists(t, first)).toBe(false);
    expect(await fileExists(t, second)).toBe(true);
});

test('setAvatar keeps the file when the same one is set again', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const file = await storeFile(t, 'image/png');

    await alice.client.action(api.users.setAvatar, { storageId: file });
    await alice.client.action(api.users.setAvatar, { storageId: file });

    expect(await fileExists(t, file)).toBe(true);
});

test('setAvatar rejects a non-image and deletes the upload', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const file = await storeFile(t, 'text/plain');

    await expect(alice.client.action(api.users.setAvatar, { storageId: file })).rejects.toThrow(AVATAR_TYPE);
    expect(await fileExists(t, file)).toBe(false);
});

test('setAvatar rejects files over 5 MB', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const file = await storeFile(t, 'image/png', MAX_AVATAR_BYTES + 1);

    await expect(alice.client.action(api.users.setAvatar, { storageId: file })).rejects.toThrow(AVATAR_TOO_BIG);
    expect(await fileExists(t, file)).toBe(false);
});

test('setAvatar rejects an unknown file', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const file = await storeFile(t, 'image/png');

    await t.run(async ctx => ctx.storage.delete(file));

    await expect(alice.client.action(api.users.setAvatar, { storageId: file })).rejects.toThrow(AVATAR_NOT_FOUND);
});

test('setAvatar(null) falls back to initials', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const file = await storeFile(t, 'image/png');

    await alice.client.action(api.users.setAvatar, { storageId: file });
    await alice.client.action(api.users.setAvatar, { storageId: null });

    expect((await alice.client.query(api.users.me, {}))?.avatar).toBeNull();
    expect(await fileExists(t, file)).toBe(false);
});

test('setSound stores the choice', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');

    await alice.client.mutation(api.users.setSound, { sound: 'pop' });

    expect((await alice.client.query(api.users.me, {}))?.sound).toBe('pop');
    await expect(alice.client.mutation(api.users.setSound, { sound: 'bad' as never })).rejects.toThrow();
});

// Review Focus 4
test('after deleting an account the partner keeps the chat as Deleted account and cannot send', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');

    await alice.client.mutation(api.contacts.add, { userId: bob.userId });
    await bob.client.mutation(api.contacts.add, { userId: alice.userId });

    const chatId = await alice.client.mutation(api.chats.open, { userId: bob.userId });

    await alice.client.mutation(api.messages.send, { chatId, body: 'hi' });
    await bob.client.mutation(api.messages.send, { chatId, body: 'hello' });
    await bob.client.mutation(api.users.deleteAccount, {});

    const [ item ] = await alice.client.query(api.chats.list, {});

    expect(item.partner).toMatchObject({ userId: null, name: 'Deleted account', avatar: null });
    expect(await alice.client.query(api.contacts.list, {})).toEqual([]);

    const page = await alice.client.query(api.messages.list, { chatId, paginationOpts: { numItems: 10, cursor: null } });

    expect(page.page.map(message => message.body)).toContain('hello');
    await expect(alice.client.mutation(api.messages.send, { chatId, body: 'still there?' })).rejects.toThrow(ACCOUNT_DELETED);
    expect((await alice.client.query(api.chats.get, { chatId }))?.canSend).toBe(false);
});

test('deleteAccount removes sessions and the old token stops working', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const other = await asUser(t, 'Bob');
    const rows = await t.run(async ctx => {
        const make = async (userId: Id<'users'>) => {
            const sessionId = await ctx.db.insert('authSessions', { userId, expirationTime: Date.now() + 1000 });

            await ctx.db.insert('authRefreshTokens', { sessionId, expirationTime: Date.now() + 1000 });
            await ctx.db.insert('authVerifiers', { sessionId });

            return sessionId;
        };
        const accountId = await ctx.db.insert('authAccounts', { userId: alice.userId, provider: 'password', providerAccountId: 'alice@example.com' });

        await ctx.db.insert('authVerificationCodes', { accountId, provider: 'password', code: 'c', expirationTime: Date.now() + 1000 });

        return { mine: await make(alice.userId), theirs: await make(other.userId) };
    });

    await alice.client.mutation(api.users.deleteAccount, {});

    const left = await t.run(async ctx => ({
        sessions: await ctx.db.query('authSessions').withIndex('userId', q => q.eq('userId', alice.userId)).collect(),
        tokens: await ctx.db.query('authRefreshTokens').withIndex('sessionId', q => q.eq('sessionId', rows.mine)).collect(),
        accounts: await ctx.db.query('authAccounts').collect(),
        codes: await ctx.db.query('authVerificationCodes').collect(),
        verifiers: await ctx.db.query('authVerifiers').collect(),
        theirTokens: await ctx.db.query('authRefreshTokens').withIndex('sessionId', q => q.eq('sessionId', rows.theirs)).collect(),
        user: await ctx.db.get('users', alice.userId)
    }));

    expect(left.sessions).toEqual([]);
    expect(left.tokens).toEqual([]);
    expect(left.accounts).toEqual([]);
    expect(left.codes).toEqual([]);
    expect(left.verifiers.map(verifier => verifier.sessionId)).toEqual([ rows.theirs ]);
    expect(left.theirTokens).toHaveLength(1);
    expect(left.user).toBeNull();

    await expect(alice.client.mutation(api.presence.heartbeat, {})).rejects.toThrow(NOT_SIGNED_IN);
    await expect(alice.client.mutation(api.chats.open, { userId: other.userId })).rejects.toThrow(NOT_SIGNED_IN);
    await expect(alice.client.mutation(api.contacts.add, { userId: other.userId })).rejects.toThrow(NOT_SIGNED_IN);
    await expect(alice.client.mutation(api.users.updateName, { name: 'X' })).rejects.toThrow(NOT_SIGNED_IN);
    await expect(alice.client.mutation(api.users.setSound, { sound: 'pop' })).rejects.toThrow(NOT_SIGNED_IN);
    await expect(alice.client.action(api.users.setAvatar, { storageId: null })).rejects.toThrow(NOT_SIGNED_IN);
    expect(await alice.client.query(api.users.me, {})).toBeNull();
    expect(await t.run(async ctx => ctx.db.query('presence').collect())).toEqual([]);
});

test('setAvatar refuses a file that belongs to another user and leaves it alone', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');
    const file = await storeFile(t, 'image/png');

    await alice.client.action(api.users.setAvatar, { storageId: file });

    await expect(bob.client.action(api.users.setAvatar, { storageId: file })).rejects.toThrow(AVATAR_NOT_FOUND);
    await bob.client.action(api.users.setAvatar, { storageId: null });

    expect(await fileExists(t, file)).toBe(true);
    expect((await alice.client.query(api.users.me, {}))?.avatar).not.toBeNull();
});

test('applyAvatar rejects a file owned by someone else', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');
    const file = await storeFile(t, 'image/png');

    await alice.client.action(api.users.setAvatar, { storageId: file });

    await expect(t.mutation(internal.users.applyAvatar, { userId: bob.userId, storageId: file })).rejects.toThrow(AVATAR_NOT_FOUND);
    expect(await fileExists(t, file)).toBe(true);
});

test('setAvatar deletes the uploaded file when it cannot be applied', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const file = await storeFile(t, 'image/png');

    await t.run(async ctx => ctx.db.delete('users', alice.userId));

    await expect(alice.client.action(api.users.setAvatar, { storageId: file })).rejects.toThrow(NOT_SIGNED_IN);
    expect(await fileExists(t, file)).toBe(false);
});

test('deleteAccount cleans presence, avatar, contacts and a chat nobody is left in', async () => {
    vi.useFakeTimers();

    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');
    const file = await storeFile(t, 'image/png');

    await alice.client.action(api.users.setAvatar, { storageId: file });
    await alice.client.mutation(api.presence.heartbeat, {});
    await bob.client.mutation(api.contacts.add, { userId: alice.userId });

    const chatId = await alice.client.mutation(api.chats.open, { userId: bob.userId });

    await alice.client.mutation(api.messages.send, { chatId, body: 'hi' });
    await alice.client.mutation(api.users.deleteAccount, {});
    await bob.client.mutation(api.users.deleteAccount, {});
    await t.finishAllScheduledFunctions(vi.runAllTimers);

    const left = await t.run(async ctx => ({
        presence: await ctx.db.query('presence').collect(),
        contacts: await ctx.db.query('contacts').collect(),
        members: await ctx.db.query('chatMembers').collect(),
        messages: await ctx.db.query('messages').collect(),
        chats: await ctx.db.query('chats').collect()
    }));

    vi.useRealTimers();

    expect(left).toEqual({ presence: [], contacts: [], members: [], messages: [], chats: [] });
    expect(await fileExists(t, file)).toBe(false);
});

test('deleteAccount works for a user with no presence, avatar or chats', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');

    await alice.client.mutation(api.users.deleteAccount, {});

    expect(await t.run(async ctx => ctx.db.get('users', alice.userId))).toBeNull();
    await expect(alice.client.mutation(api.users.deleteAccount, {})).rejects.toThrow(NOT_SIGNED_IN);
});
