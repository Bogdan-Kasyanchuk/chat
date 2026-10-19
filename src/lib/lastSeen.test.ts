import { expect, test } from 'vitest';

import lastSeenText from './lastSeen';

const now = new Date(2026, 9, 18, 15, 0).getTime();

test('lastSeenText', () => {
    expect(lastSeenText({ online: true, lastSeenAt: now }, now)).toBe('online');
    expect(lastSeenText({ online: false, lastSeenAt: now - 30_000 }, now)).toBe('last seen just now');
    expect(lastSeenText({ online: false, lastSeenAt: now - 60_000 }, now)).toBe('last seen 1 minute ago');
    expect(lastSeenText({ online: false, lastSeenAt: now - 5 * 60_000 }, now)).toBe('last seen 5 minutes ago');
    expect(lastSeenText({ online: false, lastSeenAt: new Date(2026, 9, 18, 9, 5).getTime() }, now)).toBe('last seen today at 09:05');
    expect(lastSeenText({ online: false, lastSeenAt: new Date(2026, 9, 17, 22, 0).getTime() }, now)).toBe('last seen yesterday at 22:00');
    expect(lastSeenText({ online: false, lastSeenAt: new Date(2026, 9, 12, 8, 0).getTime() }, now)).toBe('last seen Oct 12');
    expect(lastSeenText({ online: false, lastSeenAt: new Date(2025, 9, 12).getTime() }, now)).toBe('last seen Oct 12, 2025');
    expect(lastSeenText({ online: false, lastSeenAt: null }, now)).toBe('last seen a long time ago');
});
