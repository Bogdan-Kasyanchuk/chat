import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import AccountSettings from './AccountSettings';

const deleteAccount = vi.fn();
const signOut = vi.fn();
const logout = vi.fn();

vi.mock('convex/react', () => ({
    useMutation: () => deleteAccount
}));

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signOut })
}));

vi.mock('@/hooks/useLogout', () => ({
    default: () => ({ logout, loading: false })
}));

afterEach(() => {
    deleteAccount.mockReset();
    signOut.mockReset();
    logout.mockReset();
});

test('Delete account asks first, then deletes and signs out', async () => {
    deleteAccount.mockResolvedValue(null);
    signOut.mockRejectedValue(new Error('no session'));

    renderWithProviders(
        <Routes>
            <Route
                path="/"
                element={ <AccountSettings onDeleted={ vi.fn() } /> }
            />
            <Route
                path="/login"
                element={ <p>login page</p> }
            />
        </Routes>
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Delete account' }));
    expect(deleteAccount).not.toHaveBeenCalled();
    expect(screen.getByText(/Your messages stay visible to other people as Deleted account/)).toBeTruthy();

    const buttons = screen.getAllByRole('button', { name: 'Delete account' });

    await user.click(buttons[ buttons.length - 1 ]);

    expect(await screen.findByText('login page')).toBeTruthy();
    await waitFor(() => {
        expect(deleteAccount).toHaveBeenCalled();
    });
    expect(signOut).toHaveBeenCalled();
});

test('Log out uses the shared logout flow', async () => {
    renderWithProviders(<AccountSettings onDeleted={ vi.fn() } />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Log out' }));

    expect(logout).toHaveBeenCalled();
});
