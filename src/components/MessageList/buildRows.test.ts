import { expect, test } from 'vitest';

import type { MessageView } from '@/types/chat';

import buildRows, { GROUP_GAP_MS, firstUnreadId, toSections } from './buildRows';

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

const minute = 60_000;
const groups = (rows: ReturnType<typeof buildRows>) => rows
    .flatMap(row => row.kind === 'message' ? [ `${ row.message.id }${ row.first ? '<' : '' }${ row.last ? '>' : '' }` ] : []);

test('consecutive messages of one author within 5 minutes form a group', () => {
    const start = at(18, 9);
    const rows = buildRows([
        message('a', start),
        message('b', start + 2 * minute),
        message('c', start + GROUP_GAP_MS + 2 * minute)
    ], null, now);

    // a і b — одна група (перше і останнє), c — через 5 хв після b, теж у групі
    expect(groups(rows)).toEqual([ 'a<', 'b', 'c>' ]);
});

test('a gap over 5 minutes or another author starts a new group', () => {
    const start = at(18, 9);
    const rows = buildRows([
        message('a', start),
        message('b', start + GROUP_GAP_MS + 1),
        message('c', start + GROUP_GAP_MS + 2, true),
        message('d', start + GROUP_GAP_MS + 3, true)
    ], null, now);

    expect(groups(rows)).toEqual([ 'a<>', 'b<>', 'c<', 'd>' ]);
});

test('a new day inserts a day item with its label', () => {
    // 23:58 і 00:01 — три хвилини, але різні дні: дві групи
    const rows = buildRows([
        message('a', new Date(2026, 9, 17, 23, 58).getTime()),
        message('b', new Date(2026, 9, 18, 0, 1).getTime())
    ], null, now);

    expect(rows.map(row => row.kind === 'day' ? row.label : row.kind)).toEqual([ 'Yesterday', 'message', 'Today', 'message' ]);
    expect(groups(rows)).toEqual([ 'a<>', 'b<>' ]);
});

test('the unread divider splits a group', () => {
    const start = at(18, 9);
    const rows = buildRows([ message('a', start), message('b', start + minute) ], 'b' as MessageView[ 'id' ], now);

    expect(groups(rows)).toEqual([ 'a<>', 'b<>' ]);
});

test('toSections gives every day its own section so its date chip sticks only over that day', () => {
    const sections = toSections(buildRows(messages, 'c' as MessageView[ 'id' ], now));

    expect(sections.map(section => [ section.label, section.rows.map(row => row.kind === 'message' ? row.message.id : row.kind) ])).toEqual([
        [ 'October 16', [ 'a' ] ],
        [ 'Yesterday', [ 'b', 'unread', 'c' ] ],
        [ 'Today', [ 'd', 'e' ] ]
    ]);
    // Розділювач над першим повідомленням дня стоїть перед секцією цього дня, у секції без мітки
    expect(toSections(buildRows(messages, 'a' as MessageView[ 'id' ], now)).map(section => section.label))
        .toEqual([ null, 'October 16', 'Yesterday', 'Today' ]);
});
