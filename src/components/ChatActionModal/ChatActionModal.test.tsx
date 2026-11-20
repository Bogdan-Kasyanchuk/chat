import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FunctionReference, getFunctionName } from 'convex/server';
import { Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { ChatView } from '@/types/chat';

import ChatActionModal from './ChatActionModal';

const removeChat = vi.fn();
const clearHistory = vi.fn();

vi.mock('convex/react', () => ({
    useMutation: (ref: FunctionReference<'mutation'>) => getFunctionName(ref) === 'chats:remove' ? removeChat : clearHistory
}));

const chat: ChatView = {
    chatId: 'c1' as ChatView[ 'chatId' ],
    partner: { userId: 'u2' as never, name: 'Bob', avatar: null, online: true, lastSeenAt: null, isContact: true },
    muted: false,
    lastReadAt: 0,
    canSend: true
};

const renderModal = (kind: 'clear' | 'delete', onDone = vi.fn(), onLeave = vi.fn()) => {
    renderWithProviders(
        <Routes>
            <Route
                path="/"
                element={ <p>home page</p> }
            />
            <Route
                path="/chat/:chatId"
                element={
                    <ChatActionModal
                        kind={ kind }
                        chat={ chat }
                        onDone={ onDone }
                        onLeave={ onLeave }
                    />
                }
            />
        </Routes>,
        { route: '/chat/c1' }
    );

    return { onDone, onLeave };
};

afterEach(() => {
    removeChat.mockReset();
    clearHistory.mockReset();
});

test('Delete chat for everyone calls remove and goes home', async () => {
    removeChat.mockResolvedValue(null);

    const { onLeave } = renderModal('delete');
    const user = userEvent.setup();

    const dialog = screen.getByRole('dialog', { name: 'Delete chat?' });

    // Тексти MobileDelete
    expect(within(dialog).getByText('The chat with Bob and its history will be removed from your list.')).toBeTruthy();

    await user.click(within(dialog).getByRole('checkbox', { name: 'Also delete for Bob' }));
    await user.click(within(dialog).getByRole('button', { name: 'Delete chat' }));

    expect(onLeave).toHaveBeenCalled();
    expect(removeChat).toHaveBeenCalledWith({ chatId: 'c1', forEveryone: true });
    expect(await screen.findByText('home page')).toBeTruthy();
});

test('Clear history for me keeps the chat open', async () => {
    clearHistory.mockResolvedValue(null);

    const { onDone, onLeave } = renderModal('clear');

    const dialog = screen.getByRole('dialog', { name: 'Clear history?' });

    expect(within(dialog).getByText('All messages in this chat will be deleted. This can\'t be undone.')).toBeTruthy();
    expect(within(dialog).getByRole('checkbox', { name: 'Also clear for Bob' })).toBeTruthy();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Clear' }));

    expect(clearHistory).toHaveBeenCalledWith({ chatId: 'c1', forEveryone: false });
    expect(onDone).toHaveBeenCalled();
    expect(onLeave).not.toHaveBeenCalled();
    expect(screen.queryByText('home page')).toBeNull();
});
