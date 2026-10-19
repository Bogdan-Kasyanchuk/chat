import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { act, renderHook, screen } from '@testing-library/react';
import { ConvexError } from 'convex/values';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import useLogout from './useLogout';

const signOut = vi.fn();
const disconnect = vi.fn();

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signOut })
}));

vi.mock('convex/react', () => ({
    useMutation: () => disconnect
}));

const wrapper = ({ children }: { children: ReactNode }) => (
    <MantineProvider>
        <Notifications />
        <MemoryRouter>{ children }</MemoryRouter>
    </MantineProvider>
);

afterEach(() => {
    signOut.mockReset();
    disconnect.mockReset();
});

test('logout still signs out when presence.disconnect fails', async () => {
    disconnect.mockRejectedValue(new Error('offline'));
    signOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), { wrapper });

    await act(async () => {
        await result.current.logout();
    });

    expect(signOut).toHaveBeenCalled();
});

test('logout shows the error and resets loading when signOut fails', async () => {
    disconnect.mockResolvedValue(null);
    signOut.mockRejectedValue(new ConvexError('Sign out failed'));

    const { result } = renderHook(() => useLogout(), { wrapper });

    await act(async () => {
        await result.current.logout();
    });

    expect(await screen.findByText('Sign out failed')).toBeTruthy();
    expect(result.current.loading).toBe(false);
});
