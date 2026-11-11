import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { MessageView } from '@/types/chat';

import MessageActionsSheet from './MessageActionsSheet';

const makeMessage = (patch: Partial<MessageView> = {}): MessageView => ({
    id: 'm1' as MessageView[ 'id' ],
    body: 'Thanks, I’ll be there',
    createdAt: new Date(2026, 10, 11, 9, 15).getTime(),
    authorIsMe: true,
    editedAt: 2,
    forwardedFrom: null,
    replyTo: null,
    read: false,
    ...patch
});

const renderSheet = (props: Partial<Parameters<typeof MessageActionsSheet>[ 0 ]> = {}) => {
    const handlers = { onAction: vi.fn(), onClose: vi.fn() };

    renderWithProviders(
        <MessageActionsSheet
            message={ makeMessage() }
            canSend
            opened
            { ...handlers }
            { ...props }
        />
    );

    return handlers;
};

test('the sheet previews the message above the actions (MobileActions)', () => {
    renderSheet();

    const dialog = screen.getByRole('dialog', { name: 'Message actions' });

    expect(within(dialog).getByText('Thanks, I’ll be there')).toBeTruthy();
    expect(within(dialog).getByText('edited')).toBeTruthy();
    expect(within(dialog).getByText('09:15')).toBeTruthy();
    expect(within(dialog).getAllByRole('button').map(button => button.textContent)).toEqual([ 'Reply', 'Edit', 'Copy text', 'Forward', 'Select', 'Delete' ]);
});

test('a read-only chat leaves out Reply and Edit, a partner message has no Edit', () => {
    renderSheet({ canSend: false, message: makeMessage({ authorIsMe: false }) });

    expect(within(screen.getByRole('dialog')).getAllByRole('button').map(button => button.textContent)).toEqual([ 'Copy text', 'Forward', 'Select', 'Delete' ]);
});

test('a tap on the preview closes the sheet like a tap on the overlay', async () => {
    const { onClose, onAction } = renderSheet();

    await userEvent.setup().click(screen.getByText('Thanks, I’ll be there'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAction).not.toHaveBeenCalled();
});

test('an action closes the sheet and reports itself', async () => {
    const { onClose, onAction } = renderSheet();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Copy text' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith('copy');
});
