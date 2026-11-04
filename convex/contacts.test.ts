import { afterEach, expect, test, vi } from 'vitest';

import { api } from './_generated/api';
import { CANNOT_ADD_SELF, USER_NOT_FOUND } from './chatRules';
import { asUser, setup } from './test.setup';

afterEach(() => {
    vi.useRealTimers();
});

test('contacts.add is idempotent and shows up in the list with presence', async () => {
    vi.useFakeTimers();

    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');

    await bob.client.mutation(api.presence.heartbeat, {});
    await alice.client.mutation(api.contacts.add, { userId: bob.userId });
    await alice.client.mutation(api.contacts.add, { userId: bob.userId });

    const rows = await t.run(async ctx => ctx.db.query('contacts').collect());

    expect(rows).toHaveLength(1);
    expect(await alice.client.query(api.contacts.list, {})).toEqual([
        {
            userId: bob.userId,
            name: 'Bob',
            avatar: 'https://example.com/Bob.png',
            online: true,
            lastSeenAt: Date.now(),
            chatId: null
        }
    ]);
});

test('contacts.list is sorted by name', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const carol = await asUser(t, 'Carol');
    const bob = await asUser(t, 'Bob');

    await alice.client.mutation(api.contacts.add, { userId: carol.userId });
    await alice.client.mutation(api.contacts.add, { userId: bob.userId });

    const list = await alice.client.query(api.contacts.list, {});

    expect(list.map(item => item.name)).toEqual([ 'Bob', 'Carol' ]);
});

test('contacts.add rejects yourself and unknown users', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');

    await t.run(async ctx => ctx.db.delete('users', bob.userId));

    await expect(alice.client.mutation(api.contacts.add, { userId: alice.userId })).rejects.toThrow(CANNOT_ADD_SELF);
    await expect(alice.client.mutation(api.contacts.add, { userId: bob.userId })).rejects.toThrow(USER_NOT_FOUND);
});

test('contacts.remove deletes the contact and is safe to repeat', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');

    await alice.client.mutation(api.contacts.add, { userId: bob.userId });
    await alice.client.mutation(api.contacts.remove, { userId: bob.userId });
    await alice.client.mutation(api.contacts.remove, { userId: bob.userId });

    expect(await alice.client.query(api.contacts.list, {})).toEqual([]);
});

test('contacts are private to their owner', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');

    await alice.client.mutation(api.contacts.add, { userId: bob.userId });

    expect(await bob.client.query(api.contacts.list, {})).toEqual([]);
});

test('contacts.list links an existing chat', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');

    await alice.client.mutation(api.contacts.add, { userId: bob.userId });

    const chatId = await alice.client.mutation(api.chats.open, { userId: bob.userId });
    const [ contact ] = await alice.client.query(api.contacts.list, {});

    expect(contact.chatId).toBe(chatId);
});

test('contacts.list skips a contact whose user no longer exists', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');

    await alice.client.mutation(api.contacts.add, { userId: bob.userId });
    await t.run(async ctx => ctx.db.delete('users', bob.userId));

    expect(await alice.client.query(api.contacts.list, {})).toEqual([]);
});

test('contacts.list gives no chatId while the chat is hidden for me', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');

    await alice.client.mutation(api.contacts.add, { userId: bob.userId });
    await bob.client.mutation(api.contacts.add, { userId: alice.userId });

    // Bob відкрив чат, але нічого не написав: рядок Alice прихований
    const chatId = await bob.client.mutation(api.chats.open, { userId: alice.userId });

    expect((await alice.client.query(api.contacts.list, {}))[ 0 ].chatId).toBeNull();
    expect((await bob.client.query(api.contacts.list, {}))[ 0 ].chatId).toBe(chatId);

    await alice.client.mutation(api.chats.open, { userId: bob.userId });

    expect((await alice.client.query(api.contacts.list, {}))[ 0 ].chatId).toBe(chatId);

    // «Видалити чат» для себе знову ховає його
    await alice.client.mutation(api.chats.remove, { chatId, forEveryone: false });

    expect((await alice.client.query(api.contacts.list, {}))[ 0 ].chatId).toBeNull();
});
