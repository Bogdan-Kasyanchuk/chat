import { expect, test } from 'vitest';

import initials from './initials';

test('takes up to two first letters of the words in upper case', () => {
    expect(initials('alice smith')).toBe('AS');
    expect(initials('  Bob  ')).toBe('B');
    expect(initials('Anna Maria Lopez')).toBe('AM');
});

test('an empty name gives a question mark', () => {
    expect(initials('   ')).toBe('?');
});
