import { expect, test } from 'vitest';

import { api } from './_generated/api';
import { CANNOT_ADD_SELF, USER_NOT_FOUND } from './chatRules';
import { asUser, setup } from './test.setup';

test('chats.open returns the same chat for both directions', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');

    const first = await alice.client.mutation(api.chats.open, { userId: bob.userId });
    const second = await bob.client.mutation(api.chats.open, { userId: alice.userId });
    const chats = await t.run(async ctx => ctx.db.query('chats').collect());

    expect(second).toBe(first);
    expect(chats).toHaveLength(1);
});

test('a new chat is hidden for the partner until the first message', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');
    const chatId = await alice.client.mutation(api.chats.open, { userId: bob.userId });
    const members = await t.run(async ctx => ctx.db.query('chatMembers').collect());
    const mine = members.find(member => member.userId === alice.userId);
    const theirs = members.find(member => member.userId === bob.userId);

    expect(members).toHaveLength(2);
    expect(mine).toMatchObject({ chatId, hidden: false, muted: false, lastReadAt: 0, clearedAt: 0 });
    expect(theirs).toMatchObject({ chatId, hidden: true, muted: false });
});

test('opening a chat reveals my hidden row but leaves the partner row alone', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');

    await alice.client.mutation(api.chats.open, { userId: bob.userId });
    await bob.client.mutation(api.chats.open, { userId: alice.userId });

    const members = await t.run(async ctx => ctx.db.query('chatMembers').collect());

    expect(members).toHaveLength(2);
    expect(members.every(member => !member.hidden)).toBe(true);

    await t.run(async ctx => {
        await ctx.db.patch('chatMembers', members[ 0 ]._id, { hidden: true });
    });
    await alice.client.mutation(api.chats.open, { userId: bob.userId });
    await bob.client.mutation(api.chats.open, { userId: alice.userId });

    const after = await t.run(async ctx => ctx.db.query('chatMembers').collect());

    expect(after.every(member => !member.hidden)).toBe(true);
});

test('chats.open rejects yourself and unknown users', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');

    await t.run(async ctx => ctx.db.delete('users', bob.userId));

    await expect(alice.client.mutation(api.chats.open, { userId: alice.userId })).rejects.toThrow(CANNOT_ADD_SELF);
    await expect(alice.client.mutation(api.chats.open, { userId: bob.userId })).rejects.toThrow(USER_NOT_FOUND);
});

test('unread counts only the partner messages after lastReadAt', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');
    const chatId = await alice.client.mutation(api.chats.open, { userId: bob.userId });

    await bob.client.mutation(api.chats.open, { userId: alice.userId });

    for (const body of [ 'a', 'b', 'c' ]) {
        await bob.client.mutation(api.messages.send, { chatId, body });
    }

    await alice.client.mutation(api.messages.send, { chatId, body: 'mine' });

    const [ before ] = await alice.client.query(api.chats.list, {});

    expect(before.unread).toBe(0);

    await alice.client.mutation(api.chats.markRead, { chatId });
    await t.run(async ctx => {
        const member = await ctx.db
            .query('chatMembers')
            .withIndex('by_chat', q => q.eq('chatId', chatId).eq('userId', alice.userId))
            .unique();

        await ctx.db.patch('chatMembers', member!._id, { lastReadAt: 0 });
    });

    const [ unread ] = await alice.client.query(api.chats.list, {});

    expect(unread.unread).toBe(3);

    await alice.client.mutation(api.chats.markRead, { chatId });

    const [ after ] = await alice.client.query(api.chats.list, {});

    expect(after.unread).toBe(0);
});

test('a new partner message after reading counts as unread', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');
    const chatId = await alice.client.mutation(api.chats.open, { userId: bob.userId });

    await bob.client.mutation(api.chats.open, { userId: alice.userId });
    await bob.client.mutation(api.messages.send, { chatId, body: 'one' });
    await alice.client.mutation(api.chats.markRead, { chatId });
    await new Promise(resolve => setTimeout(resolve, 5));
    await bob.client.mutation(api.messages.send, { chatId, body: 'two' });

    const [ summary ] = await alice.client.query(api.chats.list, {});

    expect(summary.unread).toBe(1);
    expect(summary.lastMessage?.body).toBe('two');
});

test('chats.list orders by the last message', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');
    const carol = await asUser(t, 'Carol');
    const withBob = await alice.client.mutation(api.chats.open, { userId: bob.userId });
    const withCarol = await alice.client.mutation(api.chats.open, { userId: carol.userId });

    await alice.client.mutation(api.messages.send, { chatId: withBob, body: 'first' });
    await new Promise(resolve => setTimeout(resolve, 5));
    await alice.client.mutation(api.messages.send, { chatId: withCarol, body: 'second' });

    const chats = await alice.client.query(api.chats.list, {});

    expect(chats.map(chat => chat.partner.name)).toEqual([ 'Carol', 'Bob' ]);

    await new Promise(resolve => setTimeout(resolve, 5));
    await alice.client.mutation(api.messages.send, { chatId: withBob, body: 'third' });

    expect((await alice.client.query(api.chats.list, {})).map(chat => chat.partner.name)).toEqual([ 'Bob', 'Carol' ]);
});

test('chats.get returns the partner with isContact, or null for a hidden chat', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');
    const chatId = await alice.client.mutation(api.chats.open, { userId: bob.userId });

    expect(await alice.client.query(api.chats.get, { chatId })).toMatchObject({
        chatId,
        partner: { name: 'Bob', isContact: false },
        muted: false,
        canSend: true
    });

    await alice.client.mutation(api.contacts.add, { userId: bob.userId });

    expect((await alice.client.query(api.chats.get, { chatId }))?.partner.isContact).toBe(true);
    expect(await bob.client.query(api.chats.get, { chatId })).toBeNull();
});

test('unread and lastMessage ignore messages before clearedAt and hidden for me', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');
    const chatId = await alice.client.mutation(api.chats.open, { userId: bob.userId });

    await bob.client.mutation(api.chats.open, { userId: alice.userId });

    const old = await bob.client.mutation(api.messages.send, { chatId, body: 'old' });

    await bob.client.mutation(api.messages.send, { chatId, body: 'kept' });

    const hidden = await bob.client.mutation(api.messages.send, { chatId, body: 'hidden' });

    await t.run(async ctx => {
        const oldMessage = await ctx.db.get('messages', old);
        const member = await ctx.db
            .query('chatMembers')
            .withIndex('by_chat', q => q.eq('chatId', chatId).eq('userId', alice.userId))
            .unique();

        await ctx.db.patch('messages', hidden, { hiddenFor: [ alice.userId ] });
        await ctx.db.patch('chatMembers', member!._id, { clearedAt: oldMessage!._creationTime, lastReadAt: 0 });
    });

    const [ summary ] = await alice.client.query(api.chats.list, {});

    expect(summary.unread).toBe(1);
    expect(summary.lastMessage?.body).toBe('kept');
});
