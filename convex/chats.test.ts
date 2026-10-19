import { afterEach, expect, test, vi } from 'vitest';

import { api } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { CANNOT_ADD_SELF, CHAT_NOT_FOUND, USER_NOT_FOUND } from './chatRules';
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

test('chats.get returns null for an address that is not a chat id', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');

    expect(await alice.client.query(api.chats.get, { chatId: 'not-a-chat' })).toBeNull();
    // Справжній id, але іншої таблиці
    expect(await alice.client.query(api.chats.get, { chatId: alice.userId })).toBeNull();
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

afterEach(() => {
    vi.useRealTimers();
});

const startChat = async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');
    const chatId = await alice.client.mutation(api.chats.open, { userId: bob.userId });

    await bob.client.mutation(api.chats.open, { userId: alice.userId });

    return { t, alice, bob, chatId };
};

const seed = async (t: ReturnType<typeof setup>, chatId: Id<'chats'>, authorId: Id<'users'>, count: number) => {
    await t.run(async ctx => {
        for (let i = 0; i < count; i++) {
            await ctx.db.insert('messages', { chatId, authorId, body: `m${ i }`, hiddenFor: [] });
        }
    });
};

const bodies = async (t: ReturnType<typeof setup>, chatId: Id<'chats'>) => t.run(async ctx => (await ctx.db
    .query('messages')
    .withIndex('by_chat', q => q.eq('chatId', chatId))
    .collect()).map(message => message.body));

test('a muted chat reports muted in the list', async () => {
    const { alice, bob, chatId } = await startChat();

    await bob.client.mutation(api.messages.send, { chatId, body: 'hi' });

    expect(await alice.client.mutation(api.chats.setMuted, { chatId, muted: true })).toBeNull();
    expect((await alice.client.query(api.chats.list, {}))[ 0 ].muted).toBe(true);
    expect((await bob.client.query(api.chats.list, {}))[ 0 ].muted).toBe(false);

    await alice.client.mutation(api.chats.setMuted, { chatId, muted: false });

    expect((await alice.client.query(api.chats.list, {}))[ 0 ].muted).toBe(false);
});

test('setMuted, clearHistory and remove reject a non-member', async () => {
    const { t, chatId } = await startChat();
    const carol = await asUser(t, 'Carol');

    await expect(carol.client.mutation(api.chats.setMuted, { chatId, muted: true })).rejects.toThrow(CHAT_NOT_FOUND);
    await expect(carol.client.mutation(api.chats.clearHistory, { chatId, forEveryone: true })).rejects.toThrow(CHAT_NOT_FOUND);
    await expect(carol.client.mutation(api.chats.remove, { chatId, forEveryone: true })).rejects.toThrow(CHAT_NOT_FOUND);
});

test('clear history for me keeps the partner\'s history', async () => {
    const { alice, bob, chatId } = await startChat();

    await bob.client.mutation(api.messages.send, { chatId, body: 'one' });
    await alice.client.mutation(api.messages.send, { chatId, body: 'two' });

    expect(await alice.client.mutation(api.chats.clearHistory, { chatId, forEveryone: false })).toBeNull();

    const mine = await alice.client.query(api.messages.list, { chatId, paginationOpts: { numItems: 50, cursor: null } });
    const theirs = await bob.client.query(api.messages.list, { chatId, paginationOpts: { numItems: 50, cursor: null } });

    expect(mine.page).toHaveLength(0);
    expect(theirs.page.map(message => message.body).sort()).toEqual([ 'one', 'two' ]);

    await bob.client.mutation(api.messages.send, { chatId, body: 'three' });

    const after = await alice.client.query(api.messages.list, { chatId, paginationOpts: { numItems: 50, cursor: null } });

    expect(after.page.map(message => message.body)).toEqual([ 'three' ]);
});

test('clear history for everyone empties the chat for both', async () => {
    vi.useFakeTimers();

    const { t, alice, bob, chatId } = await startChat();

    await seed(t, chatId, alice.userId, 450);
    await alice.client.mutation(api.chats.clearHistory, { chatId, forEveryone: true });
    await t.finishAllScheduledFunctions(vi.runAllTimers);

    expect(await bodies(t, chatId)).toHaveLength(0);
    expect(await t.run(async ctx => ctx.db.query('chats').collect())).toHaveLength(1);
    expect(await t.run(async ctx => ctx.db.query('chatMembers').collect())).toHaveLength(2);
    expect(await bob.client.query(api.chats.get, { chatId })).not.toBeNull();
});

test('clear history for everyone keeps messages sent while the batches run', async () => {
    vi.useFakeTimers();

    const { t, alice, bob, chatId } = await startChat();

    await seed(t, chatId, alice.userId, 450);
    await alice.client.mutation(api.chats.clearHistory, { chatId, forEveryone: true });
    vi.advanceTimersByTime(1);
    await bob.client.mutation(api.messages.send, { chatId, body: 'after' });
    await t.finishAllScheduledFunctions(vi.runAllTimers);

    expect(await bodies(t, chatId)).toEqual([ 'after' ]);
});

test('delete chat for everyone removes the chat and members', async () => {
    vi.useFakeTimers();

    const { t, alice, bob, chatId } = await startChat();

    await seed(t, chatId, bob.userId, 450);
    await alice.client.mutation(api.chats.remove, { chatId, forEveryone: true });

    expect(await alice.client.query(api.chats.list, {})).toHaveLength(0);
    expect(await bob.client.query(api.chats.list, {})).toHaveLength(0);

    await t.finishAllScheduledFunctions(vi.runAllTimers);

    expect(await t.run(async ctx => ctx.db.query('messages').collect())).toHaveLength(0);
    expect(await t.run(async ctx => ctx.db.query('chatMembers').collect())).toHaveLength(0);
    expect(await t.run(async ctx => ctx.db.query('chats').collect())).toHaveLength(0);
});

test('a chat reopened while it is being deleted for everyone keeps only the new messages', async () => {
    vi.useFakeTimers();

    const { t, alice, bob, chatId } = await startChat();

    await seed(t, chatId, bob.userId, 450);
    await alice.client.mutation(api.chats.remove, { chatId, forEveryone: true });
    vi.advanceTimersByTime(1);

    // Порції ще видаляються, а Alice знову пише Bob: той самий чат, старі повідомлення не повертаються
    expect(await alice.client.mutation(api.chats.open, { userId: bob.userId })).toBe(chatId);
    expect((await alice.client.query(api.messages.list, { chatId, paginationOpts: { numItems: 50, cursor: null } })).page
        .map(message => message.body)).toEqual([]);

    await alice.client.mutation(api.messages.send, { chatId, body: 'again' });

    expect((await bob.client.query(api.messages.list, { chatId, paginationOpts: { numItems: 50, cursor: null } })).page
        .map(message => message.body)).toEqual([ 'again' ]);

    await t.finishAllScheduledFunctions(vi.runAllTimers);

    expect(await bodies(t, chatId)).toEqual([ 'again' ]);
    expect(await t.run(async ctx => ctx.db.query('chatMembers').collect())).toHaveLength(2);
    expect((await alice.client.query(api.chats.list, {})).map(chat => chat.lastMessage?.body)).toEqual([ 'again' ]);
    expect((await bob.client.query(api.chats.list, {})).map(chat => chat.lastMessage?.body)).toEqual([ 'again' ]);
});

// Review Focus 5
test('a chat deleted for me comes back with only the new messages', async () => {
    // Дата заморожена, щоб прогін не залежав від швидкості: convex-test дає _creationTime = Date.now() (ціле число),
    // коли той випереджає попередні вставки, тож нове повідомлення в ту саму мілісекунду, що й clearedAt, збігалося б
    // з міткою й було б приховане. У справжньому Convex _creationTime дробовий, там збіг неможливий; у тесті розводимо мілісекунди
    vi.useFakeTimers({ toFake: [ 'Date' ] });

    const { alice, bob, chatId } = await startChat();

    await bob.client.mutation(api.messages.send, { chatId, body: 'old 1' });
    await bob.client.mutation(api.messages.send, { chatId, body: 'old 2' });
    vi.advanceTimersByTime(1);
    await alice.client.mutation(api.chats.remove, { chatId, forEveryone: false });

    expect(await alice.client.query(api.chats.list, {})).toHaveLength(0);
    expect(await alice.client.query(api.chats.get, { chatId })).toBeNull();

    vi.advanceTimersByTime(1);
    await bob.client.mutation(api.messages.send, { chatId, body: 'new' });

    const [ summary ] = await alice.client.query(api.chats.list, {});
    const messages = await alice.client.query(api.messages.list, { chatId, paginationOpts: { numItems: 50, cursor: null } });

    expect(summary.lastMessage?.body).toBe('new');
    expect(summary.unread).toBe(1);
    expect(messages.page.map(message => message.body)).toEqual([ 'new' ]);
});
