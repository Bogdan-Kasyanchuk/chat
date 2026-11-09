import { expect, test } from 'vitest';

import avatarColor, { AVATAR_COLORS, AVATAR_NEUTRAL } from './avatarColor';

test('the palette has the seven colours from the canvas', () => {
    expect(AVATAR_COLORS).toHaveLength(7);
    expect(new Set(AVATAR_COLORS).size).toBe(7);
    expect(AVATAR_COLORS).not.toContain(AVATAR_NEUTRAL);
});

test('avatarColor is stable and spreads ids over the palette', () => {
    const ids = Array.from({ length: 50 }, (_, i) => `k17${ i.toString(36) }a9x${ (i * 7919).toString(36) }`);

    for (const id of ids) {
        expect(AVATAR_COLORS).toContain(avatarColor(id));
        expect(avatarColor(id)).toBe(avatarColor(id));
    }

    expect(new Set(ids.map(avatarColor)).size).toBeGreaterThanOrEqual(5);
});

test('avatarColor of a deleted account is neutral', () => {
    expect(avatarColor(null)).toBe(AVATAR_NEUTRAL);
});
