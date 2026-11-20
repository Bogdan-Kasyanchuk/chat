import { expect, test } from 'vitest';

import { TOKENS } from '@/theme';

import avatarColor, { AVATAR_COLORS, AVATAR_NEUTRAL } from './avatarColor';
import contrastRatio from './contrast';

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

// Ініціали білі 16 / 600 — це звичайний текст, тож потрібно 4.5:1. Кольори аватарів однакові в обох темах, тож і ініціали
test.each([ 'light', 'dark' ] as const)('%s initials (--chat-on-avatar) keep 4.5:1 on every avatar colour', scheme => {
    const initials = TOKENS[ scheme ][ '--chat-on-avatar' ];

    expect(initials).toBe('#FFFFFF');

    for (const color of AVATAR_COLORS) {
        expect(contrastRatio(initials, color), color).toBeGreaterThanOrEqual(4.5);
    }
});

// Закріплені значення: зміна порядку кольорів чи хешу непомітно перефарбувала б усіх людей
test('avatarColor keeps the colours of known ids', () => {
    expect(avatarColor('k17abc')).toBe('#1F7F7C');
    expect(avatarColor('u2')).toBe('#9C6A0E');
    expect(avatarColor('j57a2b')).toBe('#2F74B5');
});
