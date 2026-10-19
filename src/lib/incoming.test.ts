import { expect, test } from 'vitest';

import type { ChatSummary } from '@/types/chat';

import findIncoming from './incoming';

const chat = (id: string, messageId: string | null, overrides: Partial<ChatSummary> = {}) => ({
    chatId: id,
    muted: false,
    lastMessage: messageId === null
        ? null
        : { id: messageId, body: 'hi', authorIsMe: false, createdAt: 1, read: true },
    ...overrides
}) as unknown as ChatSummary;

const options = { activeChatId: null, pageVisible: true };

test('the first load never notifies', () => {
    expect(findIncoming(undefined, [ chat('a', 'm1') ], options)).toEqual([]);
});

test('a new partner message notifies', () => {
    const next = [ chat('a', 'm2') ];

    expect(findIncoming([ chat('a', 'm1') ], next, options)).toEqual(next);
});

test('the first message of a chat that was absent notifies', () => {
    const next = [ chat('a', 'm1') ];

    expect(findIncoming([], next, options)).toEqual(next);
});

test('a chat without messages does not notify', () => {
    expect(findIncoming([], [ chat('a', null) ], options)).toEqual([]);
});

test('my own message from another tab does not notify', () => {
    const mine = chat('a', 'm2', { lastMessage: { id: 'm2', body: 'hi', authorIsMe: true, createdAt: 1, read: false } } as never);

    expect(findIncoming([ chat('a', 'm1') ], [ mine ], options)).toEqual([]);
});

test('a muted chat does not notify', () => {
    expect(findIncoming([ chat('a', 'm1') ], [ chat('a', 'm2', { muted: true }) ], options)).toEqual([]);
});

test('the open chat notifies only when the tab is hidden', () => {
    const next = [ chat('a', 'm2') ];

    expect(findIncoming([ chat('a', 'm1') ], next, { activeChatId: 'a', pageVisible: true })).toEqual([]);
    expect(findIncoming([ chat('a', 'm1') ], next, { activeChatId: 'a', pageVisible: false })).toEqual(next);
});

test('an unchanged last message does not notify again', () => {
    expect(findIncoming([ chat('a', 'm1') ], [ chat('a', 'm1') ], options)).toEqual([]);
});
