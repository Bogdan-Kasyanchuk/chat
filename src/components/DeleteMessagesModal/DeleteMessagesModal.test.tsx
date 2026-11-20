import { notifications } from '@mantine/notifications';
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
    // Текст DeleteDialog: Undo немає («Рішення»)
    expect(screen.getByText('This can\'t be undone.')).toBeTruthy();
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

test('deleting messages shows a toast without Undo', async () => {
    remove.mockResolvedValue(null);

    const show = vi.spyOn(notifications, 'show');
    const user = userEvent.setup();
    const { unmount } = renderWithProviders(
        <DeleteMessagesModal
            messages={ [ message('a', true), message('b', true) ] }
            partnerName="Bob"
            onDone={ vi.fn() }
        />
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: '2 messages deleted' }));
    // Лише текст і іконка: ні кнопки, ні іншого вмісту, куди можна було б сховати Undo
    expect(typeof show.mock.lastCall?.[ 0 ].message).toBe('string');
    unmount();

    renderWithProviders(
        <DeleteMessagesModal
            messages={ [ message('a', true) ] }
            partnerName="Bob"
            onDone={ vi.fn() }
        />
    );
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Message deleted' }));
    show.mockRestore();
});
