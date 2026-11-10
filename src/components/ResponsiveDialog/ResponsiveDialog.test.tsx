import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { mockViewport } from '@/test/viewport';

import ResponsiveDialog from './ResponsiveDialog';

const renderDialog = (onClose = vi.fn()) => renderWithProviders(
    <ResponsiveDialog
        title="Log out?"
        opened
        onClose={ onClose }
    >
        <p>You will need to sign in again to read your messages.</p>
    </ResponsiveDialog>
);

// Артборди LogoutDialog і MobileDelete: діалог посередині на десктопі, нижня панель з ручкою на телефоні
test('ResponsiveDialog is a modal on desktop and a bottom sheet on a phone', () => {
    mockViewport(true);

    const { unmount } = renderDialog();

    expect(screen.getByRole('dialog', { name: 'Log out?' }).closest('.mantine-Modal-root')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
    expect(screen.queryByTestId('sheet-handle')).toBeNull();

    unmount();
    mockViewport(false);
    renderDialog();

    const sheet = screen.getByRole('dialog', { name: 'Log out?' });

    expect(sheet.closest('.mantine-Drawer-root')).toBeTruthy();
    expect(screen.getByTestId('sheet-handle')).toBeTruthy();
    expect(screen.getByText('You will need to sign in again to read your messages.')).toBeTruthy();
});

test('Escape closes the bottom sheet', async () => {
    const onClose = vi.fn();

    renderDialog(onClose);

    await userEvent.setup().keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
});
