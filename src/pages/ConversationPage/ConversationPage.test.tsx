import { notifications } from '@mantine/notifications';
import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FunctionReference, getFunctionName } from 'convex/server';
import { ConvexError } from 'convex/values';
import { useSyncExternalStore } from 'react';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { ChatView, MessageView } from '@/types/chat';

import ConversationPage from './ConversationPage';

let chat: ChatView | null | undefined;
let chatError: Error | null = null;
let messagesError: Error | null = null;
let messages: MessageView[] = [];
const send = vi.fn();
const markRead = vi.fn();
const edit = vi.fn();
const removeMessages = vi.fn();
const removeChat = vi.fn();

// Як у Convex: нове значення запиту одразу перемальовує підписані компоненти
const listeners = new Set<() => void>();
const notify = () => {
    listeners.forEach(listener => {
        listener();
    });
};
const setChat = (next: ChatView | null) => {
    chat = next;
    notify();
};
const setMessages = (next: MessageView[]) => {
    messages = next;
    notify();
};
const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
};

const mutations: Record<string, typeof send> = {
    'messages:send': send,
    'messages:edit': edit,
    'messages:remove': removeMessages,
    'chats:markRead': markRead,
    'chats:remove': removeChat
};

vi.mock('convex/react', () => ({
    useQuery: (ref: FunctionReference<'query'>) => {
        if ([ 'chats:list', 'contacts:list' ].includes(getFunctionName(ref))) {
            return [];
        }

        if (getFunctionName(ref) !== 'chats:get') {
            return { id: 'me', name: 'Alice', email: 'alice@example.com', avatar: null, sound: 'classic' };
        }

        // eslint-disable-next-line react-hooks/rules-of-hooks -- мок useQuery: гілка стала для кожного виклику
        const current = useSyncExternalStore(subscribe, () => chat);

        if (chatError) {
            throw chatError;
        }

        return current;
    },
    usePaginatedQuery: () => {
        const current = useSyncExternalStore(subscribe, () => messages);

        if (messagesError) {
            throw messagesError;
        }

        return { results: [ ...current ].reverse(), status: 'Exhausted', isLoading: false, loadMore: vi.fn() };
    },
    useMutation: (ref: FunctionReference<'mutation'>) => mutations[ getFunctionName(ref) ] ?? vi.fn()
}));

const message = (id: string, body: string, authorIsMe = false, minutesAgo = 60): MessageView => ({
    id: id as MessageView[ 'id' ],
    body,
    createdAt: Date.now() - minutesAgo * 60_000,
    authorIsMe,
    editedAt: null,
    forwardedFrom: null,
    replyTo: null,
    read: true
});

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
    messagesError = null;
    send.mockResolvedValue('m9');
    markRead.mockResolvedValue(null);
});

afterEach(() => {
    Object.values(mutations).forEach(mock => {
        mock.mockReset();
    });
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

test('ConversationPage offers to add a stranger to contacts', () => {
    chat = makeChat({ partner: { ...makeChat().partner, isContact: false } });
    renderPage();

    expect(screen.getByText('Bob is not in your contacts')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add to contacts' })).toBeTruthy();
});

test('ConversationPage cancels a reply on Escape and then closes the chat', async () => {
    chat = makeChat();
    messages = [ message('m1', 'Lunch?') ];
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

test('ConversationPage shows a generic error instead of Chat not found for other failures', () => {
    const show = vi.spyOn(notifications, 'show');

    vi.spyOn(console, 'error').mockImplementation(() => {});
    chatError = new Error('Something exploded');
    renderPage();

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to chats' })).toBeTruthy();
    expect(screen.queryByText('home page')).toBeNull();
    expect(show).not.toHaveBeenCalled();
});

test('ConversationPage treats Chat not found from the message list as a missing chat', () => {
    const show = vi.spyOn(notifications, 'show');

    // Гонка: messages.list дізнався, що чату немає, раніше за chats.get
    vi.spyOn(console, 'error').mockImplementation(() => {});
    chat = makeChat();
    messagesError = new ConvexError('Chat not found');
    renderPage();

    expect(screen.getByText('home page')).toBeTruthy();
    expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Chat not found' }));
});

test('right click opens the menu and Reply fills the composer bar', async () => {
    chat = makeChat();
    messages = [ message('m1', 'Lunch?') ];
    renderPage();

    fireEvent.contextMenu(screen.getByText('Lunch?'));

    // Чуже повідомлення не редагується
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Reply' }));

    expect(screen.getByText('Reply to Bob')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reply' })).toBeNull();
});

test('Edit saves through messages.edit and gives the draft back', async () => {
    chat = makeChat();
    messages = [ message('m1', 'Old text', true) ];
    edit.mockResolvedValue(null);
    renderPage();

    const user = userEvent.setup();
    const field = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' });

    await user.type(field, 'My draft');
    fireEvent.contextMenu(screen.getByText('Old text'));
    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByText('Edit message')).toBeTruthy();
    expect(field.value).toBe('Old text');

    await user.clear(field);
    await user.type(field, 'New text{Enter}');

    expect(edit).toHaveBeenCalledWith({ messageId: 'm1', body: 'New text' });
    expect(send).not.toHaveBeenCalled();
    expect(screen.queryByText('Edit message')).toBeNull();
    expect(field.value).toBe('My draft');

    // Скасоване редагування теж повертає чернетку
    fireEvent.contextMenu(screen.getByText('Old text'));
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Cancel editing' }));

    expect(field.value).toBe('My draft');
});

test('Copy text puts the message on the clipboard', async () => {
    const show = vi.spyOn(notifications, 'show');

    chat = makeChat();
    messages = [ message('m1', 'Lunch?') ];
    renderPage();

    const user = userEvent.setup();

    fireEvent.contextMenu(screen.getByText('Lunch?'));
    await user.click(screen.getByRole('button', { name: 'Copy text' }));

    expect(await navigator.clipboard.readText()).toBe('Lunch?');
    expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Copied' }));
});

test('Select mode toggles messages and Delete removes them for me', async () => {
    chat = makeChat();
    messages = [ message('a', 'First', true, 30), message('b', 'Second', false, 20), message('c', 'Third', false, 10) ];
    removeMessages.mockResolvedValue(null);
    renderPage();

    const user = userEvent.setup();

    fireEvent.contextMenu(screen.getByText('First'));
    await user.click(screen.getByRole('button', { name: 'Select' }));

    expect(screen.getByText('1 selected')).toBeTruthy();
    // Шапку чату заміняє панель вибору
    expect(screen.queryByRole('button', { name: 'Chat settings' })).toBeNull();

    await user.click(screen.getByText('Third'));
    await user.click(screen.getByText('Second'));

    expect(screen.getByText('3 selected')).toBeTruthy();

    // Подвійний клік у режимі вибору не відкриває відповідь
    await user.dblClick(screen.getByText('Third'));

    expect(screen.queryByText('Reply to Bob')).toBeNull();
    expect(screen.getByText('3 selected')).toBeTruthy();

    await user.click(screen.getByText('Third'));

    expect(screen.getByText('2 selected')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    const dialog = screen.getByRole('dialog', { name: 'Delete 2 messages?' });

    // Друге повідомлення — Боба, тож видалити можна лише для себе
    expect(within(dialog).queryByRole('checkbox')).toBeNull();

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(removeMessages).toHaveBeenCalledWith({ messageIds: [ 'a', 'b' ], forEveryone: false });
    expect(screen.queryByText(/selected/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Chat settings' })).toBeTruthy();
});

test('Copy in select mode joins the texts in chronological order', async () => {
    chat = makeChat();
    messages = [ message('a', 'First', true, 30), message('b', 'Second', false, 20), message('c', 'Third', false, 10) ];
    renderPage();

    const user = userEvent.setup();

    fireEvent.contextMenu(screen.getByText('Third'));
    await user.click(screen.getByRole('button', { name: 'Select' }));
    await user.click(screen.getByText('First'));
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(await navigator.clipboard.readText()).toBe('First\n\nThird');
    // Після копіювання вибір знято
    expect(screen.queryByText(/selected/)).toBeNull();
});

test('Escape cancels the selection before the reply', async () => {
    chat = makeChat();
    messages = [ message('a', 'First'), message('b', 'Second', false, 10) ];
    renderPage();

    const user = userEvent.setup();

    await user.dblClick(screen.getByText('First'));
    fireEvent.contextMenu(screen.getByText('Second'));
    await user.click(screen.getByRole('button', { name: 'Select' }));

    expect(screen.getByText('1 selected')).toBeTruthy();
    expect(screen.getByText('Reply to Bob')).toBeTruthy();

    await user.keyboard('{Escape}');

    expect(screen.queryByText('1 selected')).toBeNull();
    expect(screen.getByText('Reply to Bob')).toBeTruthy();

    await user.keyboard('{Escape}');

    expect(screen.queryByText('Reply to Bob')).toBeNull();
    expect(screen.queryByText('home page')).toBeNull();
});

test('Delete chat goes home without the Chat not found toast', async () => {
    const show = vi.spyOn(notifications, 'show');

    chat = makeChat();
    // Сервер ховає чат ще до того, як мутація повернулась
    removeChat.mockImplementation(() => {
        setChat(null);

        return Promise.resolve(null);
    });

    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Chat settings' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete chat' }));
    await user.click(within(screen.getByRole('dialog', { name: 'Delete chat?' })).getByRole('button', { name: 'Delete' }));

    expect(removeChat).toHaveBeenCalledWith({ chatId: 'c1', forEveryone: false });
    expect(await screen.findByText('home page')).toBeTruthy();
    expect(show).not.toHaveBeenCalledWith(expect.objectContaining({ message: 'Chat not found' }));
});

test('Delete in select mode sends only the messages that are still there', async () => {
    chat = makeChat();
    messages = [ message('a', 'First', true, 30), message('b', 'Second', true, 20) ];
    removeMessages.mockResolvedValue(null);
    renderPage();

    const user = userEvent.setup();

    fireEvent.contextMenu(screen.getByText('First'));
    await user.click(screen.getByRole('button', { name: 'Select' }));
    await user.click(screen.getByText('Second'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByRole('dialog', { name: 'Delete 2 messages?' })).toBeTruthy();

    // Поки діалог відкритий, повідомлення зникає (видалене в іншій вкладці)
    act(() => {
        setMessages([ messages[ 1 ] ]);
    });

    const dialog = screen.getByRole('dialog', { name: 'Delete message?' });

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(removeMessages).toHaveBeenCalledWith({ messageIds: [ 'b' ], forEveryone: false });
});

test('Delete and Forward dialogs close when their only message disappears', async () => {
    chat = makeChat();
    messages = [ message('a', 'First', true, 30), message('b', 'Second', false, 20) ];
    renderPage();

    const user = userEvent.setup();

    fireEvent.contextMenu(screen.getByText('First'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByRole('dialog', { name: 'Delete message?' })).toBeTruthy();

    act(() => {
        setMessages([ messages[ 1 ] ]);
    });

    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.contextMenu(screen.getByText('Second'));
    await user.click(screen.getByRole('button', { name: 'Forward' }));

    expect(screen.getByRole('dialog', { name: 'Forward to' })).toBeTruthy();

    act(() => {
        setMessages([]);
    });

    expect(screen.queryByRole('dialog')).toBeNull();
});

test('A reply to a message that disappeared is dropped and the next send goes without it', async () => {
    chat = makeChat();
    messages = [ message('a', 'First', false, 30), message('b', 'Second', false, 20) ];
    renderPage();

    const user = userEvent.setup();

    await user.dblClick(screen.getByText('First'));

    expect(screen.getByText('Reply to Bob')).toBeTruthy();

    act(() => {
        setMessages([ messages[ 1 ] ]);
    });

    expect(screen.queryByText('Reply to Bob')).toBeNull();

    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Hello{Enter}');

    expect(send).toHaveBeenCalledWith({ chatId: 'c1', body: 'Hello' });
});

test('Editing a message that disappeared ends and gives the draft back', async () => {
    chat = makeChat();
    messages = [ message('a', 'Mine', true, 30), message('b', 'Second', false, 20) ];
    renderPage();

    const user = userEvent.setup();
    const field = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' });

    await user.type(field, 'Draft');
    fireEvent.contextMenu(screen.getByText('Mine'));
    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(field.value).toBe('Mine');

    act(() => {
        setMessages([ messages[ 1 ] ]);
    });

    expect(screen.queryByText('Edit message')).toBeNull();
    expect(field.value).toBe('Draft');
});
