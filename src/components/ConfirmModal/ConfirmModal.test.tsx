import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { mockViewport } from '@/test/viewport';

import ConfirmModal from './ConfirmModal';

const renderModal = (loading: boolean, onClose = vi.fn()) => {
    renderWithProviders(
        <ConfirmModal
            title="Delete chat?"
            text="This can't be undone."
            confirmLabel="Delete chat"
            loading={ loading }
            opened
            danger
            onConfirm={ vi.fn() }
            onClose={ onClose }
        >
            <label>
                <input type="checkbox" />
                Also delete for Bob
            </label>
        </ConfirmModal>
    );

    return onClose;
};

const buttons = () => within(screen.getByRole('dialog')).getAllByRole('button')
    .filter(button => !button.classList.contains('mantine-Modal-close'))
    .map(button => button.textContent);

test('on a desktop the dialog has the text, Cancel and then the action, focus on Cancel', async () => {
    mockViewport(true);

    const onClose = renderModal(false);
    const dialog = await screen.findByRole('dialog', { name: 'Delete chat?' });

    expect(within(dialog).getByText('This can\'t be undone.')).toBeTruthy();
    expect(within(dialog).getByRole('checkbox', { name: 'Also delete for Bob' })).toBeTruthy();
    expect(buttons()).toEqual([ 'Cancel', 'Delete chat' ]);
    expect(within(dialog).getByRole('button', { name: 'Cancel' }).hasAttribute('data-autofocus')).toBe(true);

    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
});

test('on a phone the dialog is a bottom sheet with the action above Cancel', async () => {
    renderModal(false);

    await screen.findByRole('dialog', { name: 'Delete chat?' });

    expect(screen.getByTestId('sheet-handle')).toBeTruthy();
    expect(buttons()).toEqual([ 'Delete chat', 'Cancel' ]);
});

test('cannot be closed while loading', async () => {
    mockViewport(true);

    const onClose = renderModal(true);

    expect(screen.getByRole('button', { name: 'Cancel' }).hasAttribute('disabled')).toBe(true);
    expect(document.querySelector('.mantine-Modal-close')).toBeNull();

    fireEvent.keyDown(await screen.findByRole('dialog'), { key: 'Escape' });
    fireEvent.mouseDown(document.querySelector('.mantine-Modal-overlay')!);
    fireEvent.click(document.querySelector('.mantine-Modal-overlay')!);

    expect(onClose).not.toHaveBeenCalled();
});
