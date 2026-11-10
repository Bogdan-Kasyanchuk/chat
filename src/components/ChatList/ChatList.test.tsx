import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FunctionReference, getFunctionName } from 'convex/server';
import type { ReactNode } from 'react';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { ChatSummary, ContactView } from '@/types/chat';

import ChatList from './ChatList';

const queries: Record<string, unknown> = {};
const openChat = vi.fn();

vi.mock('convex/react', () => ({
    useQuery: (ref: FunctionReference<'query'>) => queries[ getFunctionName(ref) ],
    useMutation: () => openChat
}));

const chat = (name: string, patch: Partial<ChatSummary> = {}): ChatSummary => ({
    chatId: `c-${ name }` as never,
    partner: { userId: `u-${ name }` as never, name, avatar: null, online: false, lastSeenAt: null, isContact: true },
    lastMessage: null,
    unread: 0,
    muted: false,
    lastMessageAt: 1,
    ...patch
});

const contact = (name: string): ContactView => ({
    userId: `u-${ name }` as never, name, avatar: null, online: false, lastSeenAt: null, chatId: null
});

const renderList = (search = '', footer?: ReactNode) => {
    const onAddContact = vi.fn();

    renderWithProviders(
        <ChatList
            search={ search }
            footer={ footer }
            onAddContact={ onAddContact }
        />
    );

    return onAddContact;
};

afterEach(() => {
    delete queries[ 'chats:list' ];
    delete queries[ 'contacts:list' ];
    openChat.mockReset();
});

test('the chat list shows a skeleton while loading', () => {
    renderList();

    expect(screen.getByLabelText('Loading chats')).toBeTruthy();
});

// Артборд ChatsEmpty: коло з іконкою, «No chats yet», підказка і pill-кнопка «Add contact»
test('an empty chat list shows No chats yet with Add contact', async () => {
    queries[ 'chats:list' ] = [];
    queries[ 'contacts:list' ] = [];

    const onAddContact = renderList();

    expect(screen.getByRole('heading', { name: 'No chats yet' })).toBeTruthy();
    expect(screen.getByText('Add people by email to start a conversation.')).toBeTruthy();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Add contact' }));

    expect(onAddContact).toHaveBeenCalled();
});

// Артборд SearchEmpty: ні чатів, ні контактів з таким іменем
test('search with no matches shows No results', async () => {
    queries[ 'chats:list' ] = [ chat('Bob') ];
    queries[ 'contacts:list' ] = [ contact('Bob') ];

    const onAddContact = renderList('  Olha ');

    expect(screen.getByRole('heading', { name: 'No results' })).toBeTruthy();
    expect(screen.getByText('No chats or contacts match “Olha”. To start a chat with someone new, add them by email.')).toBeTruthy();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Add contact' }));

    expect(onAddContact).toHaveBeenCalled();
});

// Текст «No chats or contacts match» обіцяє пошук і серед контактів: контакт без чату теж знаходиться
test('search also finds contacts without a chat and opens a chat with them', async () => {
    queries[ 'chats:list' ] = [ chat('Bob') ];
    queries[ 'contacts:list' ] = [ contact('Bob'), contact('Olha') ];
    openChat.mockResolvedValue('c7');

    renderList('olh');

    expect(screen.queryByRole('link', { name: /Bob/ })).toBeNull();
    // Bob уже є серед чатів, тож у контактах не дублюється
    expect(screen.getByText('Contacts')).toBeTruthy();

    await userEvent.setup().click(screen.getByRole('button', { name: /Olha/ }));

    expect(openChat).toHaveBeenCalledWith({ userId: 'u-Olha' });
});

test('search keeps a matching chat and does not repeat its partner among contacts', () => {
    queries[ 'chats:list' ] = [ chat('Bob'), chat('Carol') ];
    queries[ 'contacts:list' ] = [ contact('Bob') ];

    renderList('bo');

    expect(screen.getByRole('link', { name: /Bob/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Carol/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Bob/ })).toBeNull();
    expect(screen.queryByText('Contacts')).toBeNull();
});

// Кнопка «New chat» висить над списком: під нею лишається місце й тоді, коли пошук знайшов лише контакти
test('the list leaves room for the footer button, also with contacts only', () => {
    queries[ 'chats:list' ] = [ chat('Bob') ];
    queries[ 'contacts:list' ] = [ contact('Olha') ];

    renderList('olh', <button type="button">New chat</button>);

    expect(screen.getByRole('navigation', { name: 'Chats' }).hasAttribute('data-footer')).toBe(true);
});

test('without a footer the list has no extra room', () => {
    queries[ 'chats:list' ] = [ chat('Bob') ];
    queries[ 'contacts:list' ] = [];

    renderList();

    expect(screen.getByRole('navigation', { name: 'Chats' }).hasAttribute('data-footer')).toBe(false);
});

// Поки контакти не завантажились, «No results» був би неправдою: пошук показує скелетон
test('search waits for contacts before saying No results', () => {
    queries[ 'chats:list' ] = [ chat('Bob') ];

    renderList('olh');

    expect(screen.queryByRole('heading', { name: 'No results' })).toBeNull();
    expect(screen.getByLabelText('Loading chats')).toBeTruthy();
});
