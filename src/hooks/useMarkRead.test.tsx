import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { Id } from '@convex/_generated/dataModel';

import useMarkRead from './useMarkRead';

const markRead = vi.fn();
let visibility: 'hidden' | 'visible' = 'visible';

vi.mock('convex/react', () => ({
    useMutation: () => markRead
}));

vi.mock('@mantine/hooks', async importOriginal => ({
    ...await importOriginal<typeof import('@mantine/hooks')>(),
    useDocumentVisibility: vi.fn(() => visibility)
}));

const chatId = 'c1' as Id<'chats'>;

beforeEach(() => {
    visibility = 'visible';
    markRead.mockResolvedValue(null);
});

afterEach(() => {
    markRead.mockReset();
});

test('marks the chat read at the bottom of a visible tab with unread messages', () => {
    renderHook(() => {
        useMarkRead(chatId, { atBottom: true, hasUnread: true });
    });

    expect(markRead).toHaveBeenCalledWith({ chatId });
});

test('does not mark read away from the bottom or without unread messages', () => {
    const { rerender } = renderHook((props: { atBottom: boolean, hasUnread: boolean }) => {
        useMarkRead(chatId, props);
    }, { initialProps: { atBottom: false, hasUnread: true } });

    rerender({ atBottom: true, hasUnread: false });

    expect(markRead).not.toHaveBeenCalled();
});

test('marks read when the tab becomes visible again', () => {
    visibility = 'hidden';
    const { rerender } = renderHook(() => {
        useMarkRead(chatId, { atBottom: true, hasUnread: true });
    });

    expect(markRead).not.toHaveBeenCalled();

    visibility = 'visible';
    rerender();

    expect(markRead).toHaveBeenCalledTimes(1);
});
