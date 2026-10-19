import { expect, test } from 'vitest';

import { api } from './_generated/api';
import type { Id } from './_generated/dataModel';
import {
    ACCOUNT_DELETED,
    BATCH_SIZE_INVALID,
    CHAT_NOT_FOUND,
    DELETE_FOR_EVERYONE_OWN_ONLY,
    FORWARDED_NOT_EDITABLE,
    MAX_BATCH,
    MESSAGE_EMPTY,
    MESSAGE_NOT_FOUND,
    NOT_YOUR_MESSAGE
} from './chatRules';
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

test('messages.list says Chat not found for an address that is not a chat id', async () => {
    const { alice } = await pair();

    await expect(alice.client.query(api.messages.list, { chatId: 'not-a-chat', paginationOpts: page })).rejects.toThrow(CHAT_NOT_FOUND);
    await expect(alice.client.query(api.messages.list, { chatId: alice.userId, paginationOpts: page })).rejects.toThrow(CHAT_NOT_FOUND);
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

const bodies = async (client: Awaited<ReturnType<typeof asUser>>[ 'client' ], chatId: Id<'chats'>) => {
    const result = await client.query(api.messages.list, { chatId, paginationOpts: page });

    return result.page.map(message => message.body);
};

test('the author edits a message and it is marked edited', async () => {
    const { alice, bob, chatId } = await pair();
    const id = await alice.client.mutation(api.messages.send, { chatId, body: 'hi' });

    expect(await alice.client.mutation(api.messages.edit, { messageId: id, body: '  hello  ' })).toBeNull();

    const result = await bob.client.query(api.messages.list, { chatId, paginationOpts: page });

    expect(result.page[ 0 ]).toMatchObject({ body: 'hello' });
    expect(result.page[ 0 ].editedAt).toBeGreaterThan(0);
    await expect(alice.client.mutation(api.messages.edit, { messageId: id, body: '  ' })).rejects.toThrow(MESSAGE_EMPTY);
});

test('nobody edits someone else\'s message', async () => {
    const { alice, bob, chatId } = await pair();
    const id = await alice.client.mutation(api.messages.send, { chatId, body: 'hi' });

    await expect(bob.client.mutation(api.messages.edit, { messageId: id, body: 'x' })).rejects.toThrow(NOT_YOUR_MESSAGE);
});

test('an outsider or a user who hid the message cannot edit it', async () => {
    const { t, alice, bob, chatId } = await pair();
    const carol = await asUser(t, 'Carol');
    const id = await alice.client.mutation(api.messages.send, { chatId, body: 'hi' });

    await expect(carol.client.mutation(api.messages.edit, { messageId: id, body: 'x' })).rejects.toThrow(MESSAGE_NOT_FOUND);

    await alice.client.mutation(api.messages.remove, { messageIds: [ id ], forEveryone: false });
    await expect(alice.client.mutation(api.messages.edit, { messageId: id, body: 'x' })).rejects.toThrow(MESSAGE_NOT_FOUND);
    expect(await bodies(bob.client, chatId)).toEqual([ 'hi' ]);
});

test('a forwarded message cannot be edited', async () => {
    const { t, alice, bob, chatId } = await pair();
    const carol = await asUser(t, 'Carol');
    const toCarol = await alice.client.mutation(api.chats.open, { userId: carol.userId });
    const id = await alice.client.mutation(api.messages.send, { chatId, body: 'hi' });

    await alice.client.mutation(api.messages.forward, { messageIds: [ id ], toChatId: toCarol });

    const [ forwarded ] = (await carol.client.query(api.messages.list, { chatId: toCarol, paginationOpts: page })).page;

    await expect(alice.client.mutation(api.messages.edit, { messageId: forwarded.id, body: 'x' }))
        .rejects.toThrow(FORWARDED_NOT_EDITABLE);
    expect(bob.userId).toBeTruthy();
});

test('delete for me hides the message only for me', async () => {
    const { alice, bob, chatId } = await pair();
    const id = await alice.client.mutation(api.messages.send, { chatId, body: 'hi' });

    expect(await alice.client.mutation(api.messages.remove, { messageIds: [ id ], forEveryone: false })).toBeNull();
    expect(await bodies(alice.client, chatId)).toEqual([]);
    expect(await bodies(bob.client, chatId)).toEqual([ 'hi' ]);
});

test('delete for everyone removes my messages for both', async () => {
    const { alice, bob, chatId } = await pair();
    const a = await alice.client.mutation(api.messages.send, { chatId, body: 'a' });
    const b = await alice.client.mutation(api.messages.send, { chatId, body: 'b' });

    await alice.client.mutation(api.messages.remove, { messageIds: [ a, b ], forEveryone: true });
    expect(await bodies(alice.client, chatId)).toEqual([]);
    expect(await bodies(bob.client, chatId)).toEqual([]);
});

test('delete for everyone refuses a selection with the partner\'s message', async () => {
    const { alice, bob, chatId } = await pair();
    const mine = await alice.client.mutation(api.messages.send, { chatId, body: 'mine' });
    const theirs = await bob.client.mutation(api.messages.send, { chatId, body: 'theirs' });

    await expect(alice.client.mutation(api.messages.remove, { messageIds: [ mine, theirs ], forEveryone: true }))
        .rejects.toThrow(DELETE_FOR_EVERYONE_OWN_ONLY);
    expect(await bodies(alice.client, chatId)).toEqual([ 'theirs', 'mine' ]);
});

test('delete for me of a selection with a foreign message changes nothing', async () => {
    const { t, alice, bob, chatId } = await pair();
    const carol = await asUser(t, 'Carol');
    const mine = await alice.client.mutation(api.messages.send, { chatId, body: 'mine' });
    const other = await bob.client.mutation(api.chats.open, { userId: carol.userId });
    const foreign = await bob.client.mutation(api.messages.send, { chatId: other, body: 'x' });

    await expect(alice.client.mutation(api.messages.remove, { messageIds: [ mine, foreign ], forEveryone: false }))
        .rejects.toThrow(MESSAGE_NOT_FOUND);
    expect(await bodies(alice.client, chatId)).toEqual([ 'mine' ]);
});

test('a reply to a deleted message shows Deleted message', async () => {
    const { alice, bob, chatId } = await pair();
    const original = await alice.client.mutation(api.messages.send, { chatId, body: 'hi' });

    await bob.client.mutation(api.messages.send, { chatId, body: 'hello', replyToId: original });
    await alice.client.mutation(api.messages.remove, { messageIds: [ original ], forEveryone: true });

    const result = await bob.client.query(api.messages.list, { chatId, paginationOpts: page });

    expect(result.page[ 0 ].replyTo).toEqual({ id: null, authorName: '', body: 'Deleted message' });
});

test('forward keeps the original author through a second forward', async () => {
    const { t, alice, bob, chatId } = await pair();
    const carol = await asUser(t, 'Carol');
    const dave = await asUser(t, 'Dave');
    const toCarol = await alice.client.mutation(api.chats.open, { userId: carol.userId });
    const carolToDave = await carol.client.mutation(api.chats.open, { userId: dave.userId });
    const first = await alice.client.mutation(api.messages.send, { chatId, body: 'one' });
    const second = await alice.client.mutation(api.messages.send, { chatId, body: 'two' });

    // Порядок за _creationTime оригіналів, а не за порядком у масиві
    expect(await alice.client.mutation(api.messages.forward, { messageIds: [ second, first ], toChatId: toCarol })).toBeNull();

    const atCarol = (await carol.client.query(api.messages.list, { chatId: toCarol, paginationOpts: page })).page;

    expect(atCarol.map(message => message.body)).toEqual([ 'two', 'one' ]);
    expect(atCarol[ 0 ]).toMatchObject({ forwardedFrom: 'Alice', authorIsMe: false });

    await carol.client.mutation(api.messages.forward, { messageIds: atCarol.map(message => message.id), toChatId: carolToDave });

    const atDave = (await dave.client.query(api.messages.list, { chatId: carolToDave, paginationOpts: page })).page;

    expect(atDave.map(message => message.forwardedFrom)).toEqual([ 'Alice', 'Alice' ]);
    expect(bob.userId).toBeTruthy();
});

test('forward has the side effects of send', async () => {
    const { t, alice, chatId } = await pair();
    const carol = await asUser(t, 'Carol');
    const toCarol = await alice.client.mutation(api.chats.open, { userId: carol.userId });
    const id = await alice.client.mutation(api.messages.send, { chatId, body: 'hi' });

    expect(await carol.client.query(api.chats.list, {})).toEqual([]);
    await alice.client.mutation(api.messages.forward, { messageIds: [ id ], toChatId: toCarol });

    const chats = await carol.client.query(api.chats.list, {});

    expect(chats).toHaveLength(1);
    expect(chats[ 0 ].lastMessage).toMatchObject({ body: 'hi', authorIsMe: false });
});

test('forward to a chat I am not in is rejected', async () => {
    const { t, alice, chatId } = await pair();
    const carol = await asUser(t, 'Carol');
    const dave = await asUser(t, 'Dave');
    const foreign = await carol.client.mutation(api.chats.open, { userId: dave.userId });
    const id = await alice.client.mutation(api.messages.send, { chatId, body: 'hi' });

    await expect(alice.client.mutation(api.messages.forward, { messageIds: [ id ], toChatId: foreign }))
        .rejects.toThrow(CHAT_NOT_FOUND);
    expect(t).toBeTruthy();
});

test('forward into a chat whose partner is gone is rejected and writes nothing', async () => {
    const { t, alice, chatId } = await pair();
    const carol = await asUser(t, 'Carol');
    const toCarol = await alice.client.mutation(api.chats.open, { userId: carol.userId });
    const id = await alice.client.mutation(api.messages.send, { chatId, body: 'hi' });

    await t.run(async ctx => {
        const rows = await ctx.db.query('chatMembers').collect();

        for (const row of rows.filter(member => member.userId === carol.userId)) {
            await ctx.db.delete('chatMembers', row._id);
        }

        await ctx.db.delete('users', carol.userId);
    });

    await expect(alice.client.mutation(api.messages.forward, { messageIds: [ id ], toChatId: toCarol }))
        .rejects.toThrow(ACCOUNT_DELETED);
    expect(await t.run(async ctx => (await ctx.db.query('messages').collect()).length)).toBe(1);
});

test('forward refuses a message hidden for me, from an outsider chat or before clearedAt', async () => {
    const { t, alice, chatId } = await pair();
    const carol = await asUser(t, 'Carol');
    const toCarol = await alice.client.mutation(api.chats.open, { userId: carol.userId });
    const hidden = await alice.client.mutation(api.messages.send, { chatId, body: 'hidden' });
    const visible = await alice.client.mutation(api.messages.send, { chatId, body: 'visible' });

    await alice.client.mutation(api.messages.send, { chatId: toCarol, body: 'hello' });
    await alice.client.mutation(api.messages.remove, { messageIds: [ hidden ], forEveryone: false });
    await expect(alice.client.mutation(api.messages.forward, { messageIds: [ visible, hidden ], toChatId: toCarol }))
        .rejects.toThrow(MESSAGE_NOT_FOUND);
    await expect(carol.client.mutation(api.messages.forward, { messageIds: [ visible ], toChatId: toCarol }))
        .rejects.toThrow(MESSAGE_NOT_FOUND);

    await t.run(async ctx => {
        const message = await ctx.db.get('messages', visible);
        const member = await ctx.db
            .query('chatMembers')
            .withIndex('by_chat', q => q.eq('chatId', chatId).eq('userId', alice.userId))
            .unique();

        await ctx.db.patch('chatMembers', member!._id, { clearedAt: message!._creationTime });
    });
    await expect(alice.client.mutation(api.messages.forward, { messageIds: [ visible ], toChatId: toCarol }))
        .rejects.toThrow(MESSAGE_NOT_FOUND);
    expect(await bodies(carol.client, toCarol)).toEqual([ 'hello' ]);
});

test('remove rejects messages from different chats', async () => {
    const { t, alice, chatId } = await pair();
    const carol = await asUser(t, 'Carol');
    const other = await alice.client.mutation(api.chats.open, { userId: carol.userId });
    const a = await alice.client.mutation(api.messages.send, { chatId, body: 'a' });
    const b = await alice.client.mutation(api.messages.send, { chatId: other, body: 'b' });

    await expect(alice.client.mutation(api.messages.remove, { messageIds: [ a, b ], forEveryone: true }))
        .rejects.toThrow(MESSAGE_NOT_FOUND);
    expect(await bodies(alice.client, chatId)).toEqual([ 'a' ]);
});

test('remove and forward accept from 1 to MAX_BATCH messages', async () => {
    const { alice, chatId } = await pair();
    const id = await alice.client.mutation(api.messages.send, { chatId, body: 'a' });
    const many = Array.from({ length: MAX_BATCH + 1 }, () => id);

    await expect(alice.client.mutation(api.messages.remove, { messageIds: [], forEveryone: false }))
        .rejects.toThrow(BATCH_SIZE_INVALID);
    await expect(alice.client.mutation(api.messages.remove, { messageIds: many, forEveryone: false }))
        .rejects.toThrow(BATCH_SIZE_INVALID);
    await expect(alice.client.mutation(api.messages.forward, { messageIds: [], toChatId: chatId }))
        .rejects.toThrow(BATCH_SIZE_INVALID);
    await expect(alice.client.mutation(api.messages.forward, { messageIds: many, toChatId: chatId }))
        .rejects.toThrow(BATCH_SIZE_INVALID);
});
