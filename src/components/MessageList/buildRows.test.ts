import { expect, test } from 'vitest';

import type { MessageView } from '@/types/chat';

import buildRows, { firstUnreadId } from './buildRows';

const at = (day: number, hour: number) => new Date(2026, 9, day, hour).getTime();
const now = at(18, 20);

const message = (id: string, createdAt: number, authorIsMe = false): MessageView => ({
    id: id as MessageView[ 'id' ],
    body: id,
    createdAt,
    authorIsMe,
    editedAt: null,
    forwardedFrom: null,
    replyTo: null,
    read: true
});

const messages = [
    message('a', at(16, 10)),
    message('b', at(17, 9), true),
    message('c', at(17, 12)),
    message('d', at(18, 8), true),
    message('e', at(18, 9))
];

test('firstUnreadId is the first partner message newer than the read mark', () => {
    expect(firstUnreadId(messages, at(17, 10))).toBe('c');
    // Свої повідомлення розділювач не відкривають
    expect(firstUnreadId(messages, at(18, 7))).toBe('e');
    expect(firstUnreadId(messages, at(18, 9))).toBeNull();
});

test('buildRows puts day separators between days and the unread divider before the first unread', () => {
    const rows = buildRows(messages, 'c' as MessageView[ 'id' ], now);

    expect(rows.map(row => row.kind === 'message' ? row.message.id : row.kind === 'day' ? row.label : 'unread')).toEqual([
        'October 16',
        'a',
        'Yesterday',
        'b',
        'unread',
        'c',
        'Today',
        'd',
        'e'
    ]);
});

test('buildRows puts the divider above the day separator when the first unread opens a day', () => {
    const rows = buildRows(messages, 'a' as MessageView[ 'id' ], now);

    expect(rows.slice(0, 2).map(row => row.kind)).toEqual([ 'unread', 'day' ]);
    expect(buildRows(messages, null, now).some(row => row.kind === 'unread')).toBe(false);
});
