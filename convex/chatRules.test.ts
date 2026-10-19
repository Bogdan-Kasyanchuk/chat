import { expect, test } from 'vitest';

import { MESSAGE_EMPTY, MESSAGE_TOO_LONG, normalizeBody, pairKey } from './chatRules';

test('normalizeBody trims and rejects blank text', () => {
    expect(normalizeBody('  hi \n')).toBe('hi');
    expect(() => normalizeBody(' \n\t ')).toThrow(MESSAGE_EMPTY);
    expect(() => normalizeBody('a'.repeat(4097))).toThrow(MESSAGE_TOO_LONG);
    expect(normalizeBody('a'.repeat(4096))).toHaveLength(4096);
});

test('pairKey does not depend on the order', () => {
    expect(pairKey('b', 'a')).toBe('a|b');
    expect(pairKey('a', 'b')).toBe('a|b');
});
