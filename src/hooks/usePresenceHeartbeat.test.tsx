import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { HEARTBEAT_MS } from '@convex/chatRules';

import usePresenceHeartbeat from './usePresenceHeartbeat';

const heartbeat = vi.fn();
let visibility: 'hidden' | 'visible' = 'visible';

vi.mock('convex/react', () => ({
    useMutation: () => heartbeat
}));

vi.mock('@mantine/hooks', async importOriginal => ({
    ...await importOriginal<typeof import('@mantine/hooks')>(),
    useDocumentVisibility: vi.fn(() => visibility)
}));

beforeEach(() => {
    vi.useFakeTimers();
    visibility = 'visible';
    heartbeat.mockResolvedValue(null);
});

afterEach(() => {
    vi.useRealTimers();
    heartbeat.mockReset();
});

test('beats at once and then every HEARTBEAT_MS while the tab is visible', () => {
    renderHook(() => usePresenceHeartbeat());

    expect(heartbeat).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(HEARTBEAT_MS * 2);

    expect(heartbeat).toHaveBeenCalledTimes(3);
});

test('does not beat while the tab is hidden', () => {
    visibility = 'hidden';
    renderHook(() => usePresenceHeartbeat());
    vi.advanceTimersByTime(HEARTBEAT_MS * 2);

    expect(heartbeat).not.toHaveBeenCalled();
});

test('beats at once when the tab becomes visible again and stops after unmount', () => {
    visibility = 'hidden';
    const { rerender, unmount } = renderHook(() => usePresenceHeartbeat());

    visibility = 'visible';
    rerender();

    expect(heartbeat).toHaveBeenCalledTimes(1);

    unmount();
    vi.advanceTimersByTime(HEARTBEAT_MS * 2);

    expect(heartbeat).toHaveBeenCalledTimes(1);
});
