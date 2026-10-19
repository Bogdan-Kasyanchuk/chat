import { fireEvent, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import ConfirmModal from './ConfirmModal';

const renderModal = (loading: boolean, onClose = vi.fn()) => {
    renderWithProviders(
        <ConfirmModal
            title="Log out?"
            confirmLabel="Log out"
            loading={ loading }
            opened
            onConfirm={ vi.fn() }
            onClose={ onClose }
        >
            Are you sure?
        </ConfirmModal>
    );

    return onClose;
};

test('closes with Escape and has an enabled Cancel while idle', async () => {
    const onClose = renderModal(false);

    expect(screen.getByRole('button', { name: 'Cancel' }).hasAttribute('disabled')).toBe(false);

    fireEvent.keyDown(await screen.findByRole('dialog'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
});

test('cannot be closed while loading', async () => {
    const onClose = renderModal(true);

    expect(screen.getByRole('button', { name: 'Cancel' }).hasAttribute('disabled')).toBe(true);
    expect(document.querySelector('.mantine-Modal-close')).toBeNull();

    fireEvent.keyDown(await screen.findByRole('dialog'), { key: 'Escape' });
    fireEvent.mouseDown(document.querySelector('.mantine-Modal-overlay')!);
    fireEvent.click(document.querySelector('.mantine-Modal-overlay')!);

    expect(onClose).not.toHaveBeenCalled();
});
