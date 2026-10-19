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
