import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FunctionReference, getFunctionName } from 'convex/server';
import { Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { ChatSummary, ContactView } from '@/types/chat';

import ForwardModal from './ForwardModal';

const openChat = vi.fn();
const forward = vi.fn();

const person = (userId: string | null, name: string) => ({
    userId: userId as never,
    name,
    avatar: null,
    online: false,
    lastSeenAt: null
});

const chats: ChatSummary[] = [
    { chatId: 'c1' as never, partner: { ...person('u2', 'Bob'), isContact: true }, lastMessage: null, unread: 0, muted: false, lastMessageAt: 2 },
    { chatId: 'c2' as never, partner: { ...person(null, 'Deleted account'), isContact: false }, lastMessage: null, unread: 0, muted: false, lastMessageAt: 1 }
];

const contacts: ContactView[] = [
    { ...person('u2', 'Bob'), userId: 'u2' as never, chatId: 'c1' as never },
    { ...person('u3', 'Carol'), userId: 'u3' as never, chatId: null }
];

vi.mock('convex/react', () => ({
    useQuery: (ref: FunctionReference<'query'>) => getFunctionName(ref) === 'chats:list' ? chats : contacts,
    useMutation: (ref: FunctionReference<'mutation'>) => getFunctionName(ref) === 'chats:open' ? openChat : forward
}));

const renderModal = (onDone = vi.fn()) => {
    renderWithProviders(
        <Routes>
            <Route
                path="/chat/c1"
                element={
                    <ForwardModal
                        messageIds={ [ 'm1' as never, 'm2' as never ] }
                        onDone={ onDone }
                    />
                }
            />
            <Route
                path="/chat/c7"
                element={ <p>carol chat</p> }
            />
        </Routes>,
        { route: '/chat/c1' }
    );

    return onDone;
};

afterEach(() => {
    openChat.mockReset();
    forward.mockReset();
});

test('ForwardModal lists chats and contacts without a chat once, without deleted accounts', async () => {
    renderModal();

    expect(screen.getAllByRole('button', { name: /Bob/ })).toHaveLength(1);
    expect(screen.getByRole('button', { name: /Carol/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Deleted account/ })).toBeNull();

    await userEvent.setup().type(screen.getByRole('textbox', { name: 'Search' }), 'car');

    expect(screen.queryByRole('button', { name: /Bob/ })).toBeNull();
    expect(screen.getByRole('button', { name: /Carol/ })).toBeTruthy();
});

test('Forward to a contact without a chat opens it first', async () => {
    openChat.mockResolvedValue('c7');
    forward.mockResolvedValue(null);

    const onDone = renderModal();

    await userEvent.setup().click(screen.getByRole('button', { name: /Carol/ }));

    expect(openChat).toHaveBeenCalledWith({ userId: 'u3' });
    expect(forward).toHaveBeenCalledWith({ messageIds: [ 'm1', 'm2' ], toChatId: 'c7' });
    expect(onDone).toHaveBeenCalledWith(true);
    expect(await screen.findByText('carol chat')).toBeTruthy();
});

test('Forward to an existing chat does not open it again', async () => {
    forward.mockResolvedValue(null);
    renderModal();

    await userEvent.setup().click(screen.getByRole('button', { name: /Bob/ }));

    expect(openChat).not.toHaveBeenCalled();
    expect(forward).toHaveBeenCalledWith({ messageIds: [ 'm1', 'm2' ], toChatId: 'c1' });
});
