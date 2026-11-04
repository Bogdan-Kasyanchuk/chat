import { expect, test } from 'vitest';

import { dayLabel, formatClock, formatListTime } from './formatTime';

const now = new Date(2026, 9, 18, 15, 0).getTime();

test('formatClock uses 24-hour local time with leading zeros', () => {
    expect(formatClock(new Date(2026, 9, 18, 14, 2).getTime())).toBe('14:02');
    expect(formatClock(new Date(2026, 9, 18, 0, 5).getTime())).toBe('00:05');
});

test('formatListTime', () => {
    expect(formatListTime(new Date(2026, 9, 18, 14, 2).getTime(), now)).toBe('14:02');
    expect(formatListTime(new Date(2026, 9, 12, 9, 0).getTime(), now)).toBe('Mon');
    expect(formatListTime(new Date(2026, 9, 17, 9, 0).getTime(), now)).toBe('Sat');
    expect(formatListTime(new Date(2026, 9, 11, 9, 0).getTime(), now)).toBe('Oct 11');
    expect(formatListTime(new Date(2026, 3, 1).getTime(), now)).toBe('Apr 1');
    expect(formatListTime(new Date(2025, 9, 12).getTime(), now)).toBe('Oct 12, 2025');
});

test('dayLabel', () => {
    expect(dayLabel(new Date(2026, 9, 18, 1, 0).getTime(), now)).toBe('Today');
    expect(dayLabel(new Date(2026, 9, 17, 23, 59).getTime(), now)).toBe('Yesterday');
    expect(dayLabel(new Date(2026, 9, 12).getTime(), now)).toBe('October 12');
    expect(dayLabel(new Date(2025, 9, 12).getTime(), now)).toBe('October 12, 2025');
});
