import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { MessageView } from '@/types/chat';

import DeleteMessagesModal from './DeleteMessagesModal';

const remove = vi.fn();

vi.mock('convex/react', () => ({
    useMutation: () => remove
}));

const message = (id: string, authorIsMe: boolean): MessageView => ({
    id: id as MessageView[ 'id' ],
    body: id,
    createdAt: 1,
    authorIsMe,
    editedAt: null,
    forwardedFrom: null,
    replyTo: null,
    read: true
});

afterEach(() => {
    remove.mockReset();
});

test('Delete offers Also delete for Bob only when all selected are mine', async () => {
    remove.mockResolvedValue(null);

    const onDone = vi.fn();
    const { unmount } = renderWithProviders(
        <DeleteMessagesModal
            messages={ [ message('a', true), message('b', false) ] }
            partnerName="Bob"
            onDone={ onDone }
        />
    );

    expect(screen.getByRole('dialog', { name: 'Delete 2 messages?' })).toBeTruthy();
    expect(screen.queryByRole('checkbox')).toBeNull();
    unmount();

    renderWithProviders(
        <DeleteMessagesModal
            messages={ [ message('a', true) ] }
            partnerName="Bob"
            onDone={ onDone }
        />
    );

    const user = userEvent.setup();

    expect(screen.getByRole('dialog', { name: 'Delete message?' })).toBeTruthy();

    await user.click(screen.getByRole('checkbox', { name: 'Also delete for Bob' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(remove).toHaveBeenCalledWith({ messageIds: [ 'a' ], forEveryone: true });
    expect(onDone).toHaveBeenCalledWith(true);
});

test('DeleteMessagesModal has no checkbox when the partner account is deleted', () => {
    renderWithProviders(
        <DeleteMessagesModal
            messages={ [ message('a', true) ] }
            partnerName={ null }
            onDone={ vi.fn() }
        />
    );

    expect(screen.queryByRole('checkbox')).toBeNull();
});
