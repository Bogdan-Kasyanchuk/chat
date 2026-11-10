import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { mockViewport } from '@/test/viewport';

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
                element={ <AccountSettings /> }
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
    expect(screen.getByText('Your profile, contacts and chats are deleted for good. People you talked to will see “Deleted account”.')).toBeTruthy();

    const buttons = screen.getAllByRole('button', { name: 'Delete account' });

    await user.click(buttons[ buttons.length - 1 ]);

    expect(await screen.findByText('login page')).toBeTruthy();
    await waitFor(() => {
        expect(deleteAccount).toHaveBeenCalled();
    });
    expect(signOut).toHaveBeenCalled();
});

test('Log out asks first, then uses the shared logout flow', async () => {
    renderWithProviders(<AccountSettings />);

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Log out' }));
    expect(logout).not.toHaveBeenCalled();

    const dialog = screen.getByRole('dialog', { name: 'Log out?' });

    await user.click(within(dialog).getByRole('button', { name: 'Log out' }));

    expect(logout).toHaveBeenCalled();
});

// Артборд Settings → Account: рядки «Log out» і червоний «Delete account» під заголовком розділу
test('the Account section has Log out and Delete account rows', () => {
    renderWithProviders(<AccountSettings />);

    expect(screen.getByRole('heading', { name: 'Account' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Log out' }).hasAttribute('data-danger')).toBe(false);
    expect(screen.getByRole('button', { name: 'Delete account' }).hasAttribute('data-danger')).toBe(true);
});

// На телефоні діалоги — нижні панелі (артборд MobileDelete): головна дія над «Cancel»
test('Log out asks for confirmation in a bottom sheet on the phone', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AccountSettings />);

    await user.click(screen.getByRole('button', { name: 'Log out' }));

    const sheet = screen.getByRole('dialog', { name: 'Log out?' });

    expect(sheet.closest('.mantine-Drawer-root')).toBeTruthy();

    const buttons = within(sheet).getAllByRole('button').map(button => button.textContent);

    expect(buttons).toEqual([ 'Log out', 'Cancel' ]);
});

test('Log out asks for confirmation in a dialog on the desktop', async () => {
    mockViewport(true);

    const user = userEvent.setup();

    renderWithProviders(<AccountSettings />);

    await user.click(screen.getByRole('button', { name: 'Log out' }));

    const dialog = screen.getByRole('dialog', { name: 'Log out?' });

    expect(dialog.closest('.mantine-Modal-root')).toBeTruthy();
    expect(within(dialog).getByText('You will need to sign in again to read your messages.')).toBeTruthy();

    const buttons = within(dialog).getAllByRole('button').map(button => button.textContent || button.getAttribute('aria-label'));

    expect(buttons).toEqual([ 'Close', 'Cancel', 'Log out' ]);
});

// Хрестика в нижній панелі немає: без підказки фокус став би на першу кнопку — на саме видалення
test('the confirmation starts on Cancel, not on the destructive action', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AccountSettings />);

    await user.click(screen.getByRole('button', { name: 'Delete account' }));

    const sheet = screen.getByRole('dialog', { name: 'Delete account?' });

    await waitFor(() => {
        expect(document.activeElement).toBe(within(sheet).getByRole('button', { name: 'Cancel' }));
    });
});
