import { afterEach, expect, test, vi } from 'vitest';

import { MAX_RECENT_EMOJI, emojiOnlyCount, insertAtCursor, pushRecent, readRecent, writeRecent } from './emoji';

afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
});

test('insertAtCursor replaces the selection and moves the caret after the emoji', () => {
    expect(insertAtCursor('Hi there', 2, 2, ' 👋', 4096)).toEqual({ value: 'Hi 👋 there', caret: 5 });
    expect(insertAtCursor('Hi there', 3, 8, '🙂', 4096)).toEqual({ value: 'Hi 🙂', caret: 5 });
});

test('insertAtCursor refuses to go over the limit', () => {
    expect(insertAtCursor('abc', 3, 3, '😀', 4)).toEqual({ value: 'abc', caret: 3 });
});

test('emojiOnlyCount', () => {
    expect(emojiOnlyCount('🎉')).toBe(1);
    expect(emojiOnlyCount(' 🎉🙌 ')).toBe(2);
    expect(emojiOnlyCount('👍🏽')).toBe(1);
    expect(emojiOnlyCount('👨‍👩‍👧')).toBe(1);
    expect(emojiOnlyCount('🇺🇦')).toBe(1);
    expect(emojiOnlyCount('ok 👍')).toBe(0);
    expect(emojiOnlyCount('123')).toBe(0);
    expect(emojiOnlyCount('')).toBe(0);
});

test('pushRecent moves a repeat to the front and keeps 18', () => {
    expect(pushRecent([ '😀', '🎉', '🙌' ], '🎉')).toEqual([ '🎉', '😀', '🙌' ]);

    const many = Array.from({ length: MAX_RECENT_EMOJI }, (_, index) => `e${ index }`);
    const next = pushRecent(many, '😀');

    expect(next).toHaveLength(18);
    expect(next[ 0 ]).toBe('😀');
    expect(next).not.toContain('e17');
});

test('recent emoji round-trips through localStorage', () => {
    writeRecent([ '🎉', '😀' ]);

    expect(readRecent()).toEqual([ '🎉', '😀' ]);
});

test('readRecent survives a throwing localStorage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked');
    });

    expect(readRecent()).toEqual([]);
    expect(() => {
        writeRecent([ '😀' ]);
    }).not.toThrow();
});
