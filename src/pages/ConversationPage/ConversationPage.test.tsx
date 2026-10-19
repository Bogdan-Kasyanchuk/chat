import { notifications } from '@mantine/notifications';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FunctionReference, getFunctionName } from 'convex/server';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { ChatView, MessageView } from '@/types/chat';

import ConversationPage from './ConversationPage';

let chat: ChatView | null | undefined;
let chatError: Error | null = null;
let messages: MessageView[] = [];
const send = vi.fn();
const markRead = vi.fn();

vi.mock('convex/react', () => ({
    useQuery: (ref: FunctionReference<'query'>) => {
        if (getFunctionName(ref) !== 'chats:get') {
            return { id: 'me', name: 'Alice', email: 'alice@example.com', avatar: null, sound: 'classic' };
        }

        if (chatError) {
            throw chatError;
        }

        return chat;
    },
    usePaginatedQuery: () => ({ results: messages, status: 'Exhausted', isLoading: false, loadMore: vi.fn() }),
    useMutation: (ref: FunctionReference<'mutation'>) => getFunctionName(ref) === 'messages:send' ? send : markRead
}));

const makeChat = (patch: Partial<ChatView> = {}): ChatView => ({
    chatId: 'c1' as ChatView[ 'chatId' ],
    partner: { userId: 'u2' as never, name: 'Bob', avatar: null, online: true, lastSeenAt: null, isContact: true },
    muted: false,
    lastReadAt: 0,
    canSend: true,
    ...patch
});

const renderPage = () => renderWithProviders(
    <Routes>
        <Route
            path="/"
            element={ <p>home page</p> }
        />
        <Route
            path="/chat/:chatId"
            element={ <ConversationPage /> }
        />
    </Routes>,
    { route: '/chat/c1' }
);

beforeEach(() => {
    messages = [];
    chatError = null;
    send.mockResolvedValue('m9');
    markRead.mockResolvedValue(null);
});

afterEach(() => {
    send.mockReset();
    markRead.mockReset();
    vi.restoreAllMocks();
});

test('ConversationPage shows the partner and sends a message', async () => {
    chat = makeChat();
    renderPage();

    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.getByText('online')).toBeTruthy();

    await userEvent.setup().type(screen.getByRole('textbox', { name: 'Message' }), 'Hi Bob{Enter}');

    expect(send).toHaveBeenCalledWith({ chatId: 'c1', body: 'Hi Bob' });
});

test('ConversationPage disables the composer for a deleted account', () => {
    chat = makeChat({
        partner: { userId: null, name: 'Deleted account', avatar: null, online: false, lastSeenAt: null, isContact: false },
        canSend: false
    });
    renderPage();

    expect(screen.getByText('Deleted account')).toBeTruthy();
    expect(screen.getByText('You can\'t message a deleted account')).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: 'Message' })).toBeNull();
    // Ні статусу, ні пропозиції додати в контакти
    expect(screen.queryByText(/last seen/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add to contacts' })).toBeNull();
});

test('ConversationPage redirects home when the chat is gone', () => {
    const show = vi.spyOn(notifications, 'show');

    chat = null;
    renderPage();

    expect(screen.getByText('home page')).toBeTruthy();
    expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Chat not found' }));
});

test('ConversationPage redirects home when the chat id in the address is malformed', () => {
    const show = vi.spyOn(notifications, 'show');

    // React пише перехоплену помилку в консоль — у виводі тестів вона не потрібна
    vi.spyOn(console, 'error').mockImplementation(() => {});
    chatError = new Error('ArgumentValidationError: Value does not match validator');
    renderPage();

    expect(screen.getByText('home page')).toBeTruthy();
    expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Chat not found' }));
});

test('ConversationPage offers to add a stranger to contacts', () => {
    chat = makeChat({ partner: { ...makeChat().partner, isContact: false } });
    renderPage();

    expect(screen.getByText('Bob is not in your contacts')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add to contacts' })).toBeTruthy();
});

test('ConversationPage cancels a reply on Escape and then closes the chat', async () => {
    chat = makeChat();
    messages = [ {
        id: 'm1' as MessageView[ 'id' ],
        body: 'Lunch?',
        createdAt: Date.now() - 60_000,
        authorIsMe: false,
        editedAt: null,
        forwardedFrom: null,
        replyTo: null,
        read: true
    } ];
    renderPage();

    const user = userEvent.setup();

    await user.dblClick(screen.getByText('Lunch?'));

    expect(screen.getByText('Reply to Bob')).toBeTruthy();

    await user.keyboard('{Escape}');

    expect(screen.queryByText('Reply to Bob')).toBeNull();
    expect(screen.getByText('Bob')).toBeTruthy();

    await user.keyboard('{Escape}');

    expect(screen.getByText('home page')).toBeTruthy();
});
