import { expect, test } from 'vitest';

import { api } from './_generated/api';
import { ACCOUNT_DELETED, CHAT_NOT_FOUND, MESSAGE_EMPTY, MESSAGE_NOT_FOUND } from './chatRules';
import { asUser, setup } from './test.setup';

const page = { numItems: 20, cursor: null };

const pair = async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');
    const chatId = await alice.client.mutation(api.chats.open, { userId: bob.userId });

    return { t, alice, bob, chatId };
};

test('send trims the text and the partner sees the chat after the first message', async () => {
    const { alice, bob, chatId } = await pair();

    expect(await bob.client.query(api.chats.list, {})).toEqual([]);

    await alice.client.mutation(api.messages.send, { chatId, body: '  hi  ' });

    const result = await bob.client.query(api.messages.list, { chatId, paginationOpts: page });
    const chats = await bob.client.query(api.chats.list, {});

    expect(result.page.map(message => message.body)).toEqual([ 'hi' ]);
    expect(chats).toHaveLength(1);
    expect(chats[ 0 ].partner.name).toBe('Alice');
    expect(chats[ 0 ].lastMessage).toMatchObject({ body: 'hi', authorIsMe: false });
});

test('a blank message is rejected', async () => {
    const { alice, chatId } = await pair();

    await expect(alice.client.mutation(api.messages.send, { chatId, body: '   ' })).rejects.toThrow(MESSAGE_EMPTY);
});

test('an outsider cannot read, send to or see a chat', async () => {
    const { t, alice, chatId } = await pair();
    const carol = await asUser(t, 'Carol');

    await alice.client.mutation(api.messages.send, { chatId, body: 'secret' });

    await expect(carol.client.query(api.messages.list, { chatId, paginationOpts: page })).rejects.toThrow(CHAT_NOT_FOUND);
    await expect(carol.client.mutation(api.messages.send, { chatId, body: 'hi' })).rejects.toThrow(CHAT_NOT_FOUND);
    expect(await carol.client.query(api.chats.get, { chatId })).toBeNull();
    expect(await carol.client.query(api.chats.list, {})).toEqual([]);
});

test('list pages from newest to oldest', async () => {
    const { alice, chatId } = await pair();

    for (let i = 1; i <= 30; i++) {
        await alice.client.mutation(api.messages.send, { chatId, body: `m${ i }` });
    }

    const first = await alice.client.query(api.messages.list, { chatId, paginationOpts: page });
    const second = await alice.client.query(api.messages.list, {
        chatId,
        paginationOpts: { numItems: 20, cursor: first.continueCursor }
    });

    expect(first.page).toHaveLength(20);
    expect(first.page[ 0 ].body).toBe('m30');
    expect(first.isDone).toBe(false);
    expect(second.page).toHaveLength(10);
    expect(second.page[ 9 ].body).toBe('m1');
});

test('list skips messages hidden for me and those before clearedAt', async () => {
    const { t, alice, bob, chatId } = await pair();
    const old = await alice.client.mutation(api.messages.send, { chatId, body: 'old' });
    const hidden = await alice.client.mutation(api.messages.send, { chatId, body: 'hidden' });

    await alice.client.mutation(api.messages.send, { chatId, body: 'shown' });
    await t.run(async ctx => {
        await ctx.db.patch('messages', hidden, { hiddenFor: [ bob.userId ] });
    });

    const result = await bob.client.query(api.messages.list, { chatId, paginationOpts: page });

    expect(result.page.map(message => message.body)).toEqual([ 'shown', 'old' ]);

    await t.run(async ctx => {
        const message = await ctx.db.get('messages', old);
        const member = await ctx.db
            .query('chatMembers')
            .withIndex('by_chat', q => q.eq('chatId', chatId).eq('userId', bob.userId))
            .unique();

        await ctx.db.patch('chatMembers', member!._id, { clearedAt: message!._creationTime });
    });

    const cleared = await bob.client.query(api.messages.list, { chatId, paginationOpts: page });

    expect(cleared.page.map(message => message.body)).toEqual([ 'shown' ]);
});

test('my message becomes read when the partner marks the chat read', async () => {
    const { alice, bob, chatId } = await pair();

    await alice.client.mutation(api.messages.send, { chatId, body: 'hi' });

    const before = await alice.client.query(api.messages.list, { chatId, paginationOpts: page });

    expect(before.page[ 0 ].read).toBe(false);

    await bob.client.mutation(api.chats.markRead, { chatId });

    const after = await alice.client.query(api.messages.list, { chatId, paginationOpts: page });

    expect(after.page[ 0 ].read).toBe(true);
    expect((await alice.client.query(api.chats.list, {}))[ 0 ].lastMessage?.read).toBe(true);
});

test('a reply carries the quoted message', async () => {
    const { alice, bob, chatId } = await pair();
    const original = await alice.client.mutation(api.messages.send, { chatId, body: 'hi' });

    await bob.client.mutation(api.messages.send, { chatId, body: 'hello', replyToId: original });

    const result = await bob.client.query(api.messages.list, { chatId, paginationOpts: page });

    expect(result.page[ 0 ].replyTo).toEqual({ id: original, authorName: 'Alice', body: 'hi' });
});

test('a reply to a message from another chat is rejected', async () => {
    const { t, alice, chatId } = await pair();
    const carol = await asUser(t, 'Carol');
    const other = await alice.client.mutation(api.chats.open, { userId: carol.userId });
    const foreign = await alice.client.mutation(api.messages.send, { chatId: other, body: 'x' });

    await expect(alice.client.mutation(api.messages.send, { chatId, body: 'y', replyToId: foreign }))
        .rejects.toThrow(MESSAGE_NOT_FOUND);
});

test('sending marks the chat read for the sender', async () => {
    const { t, alice, chatId } = await pair();

    await alice.client.mutation(api.messages.send, { chatId, body: 'hi' });

    const members = await t.run(async ctx => ctx.db.query('chatMembers').collect());
    const mine = members.find(member => member.userId === alice.userId);
    const theirs = members.find(member => member.userId === (members.find(m => m.userId !== alice.userId)!.userId));

    expect(mine!.lastReadAt).toBeGreaterThan(0);
    expect(theirs!.lastReadAt).toBe(0);
    expect(theirs!.hidden).toBe(false);
});

test('send is rejected and the chat keeps the partner name after the account is gone', async () => {
    const { t, alice, bob, chatId } = await pair();

    await alice.client.mutation(api.messages.send, { chatId, body: 'hi' });
    await t.run(async ctx => {
        const rows = await ctx.db.query('chatMembers').collect();

        for (const row of rows.filter(member => member.userId === bob.userId)) {
            await ctx.db.delete('chatMembers', row._id);
        }

        await ctx.db.delete('users', bob.userId);
    });

    const chats = await alice.client.query(api.chats.list, {});
    const chat = await alice.client.query(api.chats.get, { chatId });

    expect(chats[ 0 ].partner).toMatchObject({ userId: null, name: 'Deleted account', isContact: false });
    expect(chat).toMatchObject({ canSend: false });
    await expect(alice.client.mutation(api.messages.send, { chatId, body: 'hello' })).rejects.toThrow(ACCOUNT_DELETED);
});
