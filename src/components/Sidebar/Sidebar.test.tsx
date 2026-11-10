import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FunctionReference, getFunctionName } from 'convex/server';
import { Route, Routes, useLocation, useNavigate } from 'react-router';
import { beforeEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { mockViewport } from '@/test/viewport';
import type { ChatSummary, ContactView } from '@/types/chat';

import Sidebar from './Sidebar';

const queries: Record<string, unknown> = {};
const openChat = vi.fn();
const findByEmail = vi.fn();

vi.mock('convex/react', () => ({
    useQuery: (ref: FunctionReference<'query'>) => queries[ getFunctionName(ref) ],
    useMutation: () => openChat,
    useConvex: () => ({ query: findByEmail })
}));

vi.mock('@convex-dev/auth/react', () => ({ useAuthActions: () => ({ signOut: vi.fn() }) }));

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

// Системний «назад» браузера чи Android і поточна адреса
const History = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <>
            <button
                type="button"
                onClick={ () => {
                    void navigate(-1);
                } }
            >
                history back
            </button>
            <output>{ `${ location.pathname }${ location.search }` }</output>
        </>
    );
};

const renderSidebar = () => renderWithProviders(
    <>
        <History />
        <Routes>
            <Route
                path="/"
                element={ <Sidebar /> }
            />
            <Route
                path="/chat/:chatId"
                element={ <Sidebar /> }
            />
        </Routes>
    </>
);

beforeEach(() => {
    queries[ 'chats:list' ] = [ chat('Bob', { unread: 3 }), chat('Carol', { unread: 2 }), chat('Dan', { unread: 5, muted: true }) ];
    queries[ 'contacts:list' ] = [ contact('Bob'), contact('Erin') ];
    openChat.mockReset();
});

test('the menu opens contacts in the sidebar and back returns to chats', async () => {
    mockViewport(true);

    const user = userEvent.setup();

    renderSidebar();

    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeTruthy();
    // На десктопі вкладок немає: розділи — у меню ☰
    expect(screen.queryByRole('navigation', { name: 'Sections' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByRole('menuitem', { name: 'Contacts' }));

    expect(screen.getByRole('searchbox', { name: 'Search contacts' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Erin/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Carol/ })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Back to chats' }));

    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Carol/ })).toBeTruthy();
});

test('New chat opens contacts on the desktop', async () => {
    mockViewport(true);
    renderSidebar();

    await userEvent.setup().click(screen.getByRole('button', { name: 'New chat' }));

    expect(screen.getByRole('searchbox', { name: 'Search contacts' })).toBeTruthy();
});

test('a search is cleared when the section changes', async () => {
    mockViewport(true);

    const user = userEvent.setup();

    renderSidebar();

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'zzz');
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByRole('menuitem', { name: 'Contacts' }));
    await user.click(screen.getByRole('button', { name: 'Back to chats' }));

    expect((screen.getByRole('searchbox', { name: 'Search' }) as HTMLInputElement).value).toBe('');
});

// Опрацьований контакт відкриває розмову, а панель повертається до чатів (як на канвасі)
test('opening a contact returns the sidebar to chats', async () => {
    mockViewport(true);
    openChat.mockResolvedValue('c-Erin');

    const user = userEvent.setup();

    renderSidebar();

    await user.click(screen.getByRole('button', { name: 'New chat' }));
    await user.click(screen.getByRole('button', { name: /Erin/ }));

    expect(await screen.findByRole('searchbox', { name: 'Search' })).toBeTruthy();
});

test('a chat opened from Add contact also returns the sidebar to chats', async () => {
    mockViewport(true);
    findByEmail.mockResolvedValue({ userId: 'u-Erin', name: 'Erin', avatar: null, isContact: true });
    openChat.mockResolvedValue('c-Erin');

    const user = userEvent.setup();

    renderSidebar();

    await user.click(screen.getByRole('button', { name: 'New chat' }));
    await user.click(screen.getByRole('button', { name: 'Add contact' }));
    await user.type(screen.getByLabelText('Email'), 'erin@example.com');
    await user.click(screen.getByRole('button', { name: 'Find' }));
    await user.click(await screen.findByRole('button', { name: 'Open chat' }));

    expect(await screen.findByRole('searchbox', { name: 'Search' })).toBeTruthy();
});

test('Settings in the main menu opens the settings dialog', async () => {
    mockViewport(true);

    const user = userEvent.setup();

    renderSidebar();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByRole('menuitem', { name: 'Settings' }));

    expect(await screen.findByRole('dialog', { name: 'Settings' })).toBeTruthy();
});

test('Add contact in the contacts section opens the dialog', async () => {
    mockViewport(true);

    const user = userEvent.setup();

    renderSidebar();

    await user.click(screen.getByRole('button', { name: 'New chat' }));
    await user.click(screen.getByRole('button', { name: 'Add contact' }));

    expect(await screen.findByRole('dialog', { name: 'Add contact' })).toBeTruthy();
});

// 3 + 2 непрочитаних; 5 у замʼюченому чаті не рахуються
test('bottom tabs show the unread total without muted chats', () => {
    renderSidebar();

    const tabs = within(screen.getByRole('navigation', { name: 'Sections' }));

    expect(tabs.getByRole('button', { name: 'Chats, 5 unread' })).toBeTruthy();
});

test('on the phone the tabs switch between Chats and Contacts with a 32px heading', async () => {
    const user = userEvent.setup();

    renderSidebar();

    expect(screen.getByRole('heading', { level: 1, name: 'Chats' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Open menu' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Contacts' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Contacts' })).toBeTruthy();
    expect(screen.getByRole('searchbox', { name: 'Search contacts' })).toBeTruthy();

    // «New chat» у шапці телефона веде до контактів
    await user.click(screen.getByRole('button', { name: /^Chats/ }));
    await user.click(screen.getByRole('button', { name: 'New chat' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Contacts' })).toBeTruthy();
});

test('the Settings tab opens the settings dialog on the phone', async () => {
    renderSidebar();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Settings' }));

    expect(await screen.findByRole('dialog', { name: 'Settings' })).toBeTruthy();
});

// Канвас MobileChats: олівець «New chat» у шапці телефона — кольору accent text (Mantine ставить --ai-color інлайн)
test('the phone New chat icon takes the accent text colour', () => {
    renderSidebar();

    expect(screen.getByRole('button', { name: 'New chat' }).style.getPropertyValue('--ai-color')).toBe('var(--chat-accent-text)');
});

// Add contact на телефоні — окремий екран: системний «назад» має закривати його, а не йти з застосунку
test('the system back closes Add contact and keeps the contacts section', async () => {
    const user = userEvent.setup();

    renderSidebar();

    await user.click(screen.getByRole('button', { name: 'Contacts' }));
    await user.click(screen.getByRole('button', { name: 'Add contact' }));

    expect(await screen.findByRole('dialog', { name: 'Add contact' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('/?add=contact');

    await user.click(screen.getByRole('button', { name: 'history back' }));

    await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: 'Add contact' })).toBeNull();
    });
    expect(screen.getByRole('heading', { level: 1, name: 'Contacts' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('/');
});

test('Back to contacts closes Add contact without leaving a history entry', async () => {
    const user = userEvent.setup();

    renderSidebar();

    await user.click(screen.getByRole('button', { name: 'Contacts' }));
    await user.click(screen.getByRole('button', { name: 'Add contact' }));
    await user.click(await screen.findByRole('button', { name: 'Back to contacts' }));

    await waitFor(() => {
        expect(screen.getByRole('status').textContent).toBe('/');
    });
    expect(screen.queryByRole('dialog', { name: 'Add contact' })).toBeNull();
});

// Чат, відкритий з Add contact, заміняє запис діалогу: «назад» з чату веде до списку, а не знову в діалог
test('back from a chat opened in Add contact returns to the list, not to the dialog', async () => {
    mockViewport(true);
    findByEmail.mockResolvedValue({ userId: 'u-Erin', name: 'Erin', avatar: null, isContact: true });
    openChat.mockResolvedValue('c-Erin');

    const user = userEvent.setup();

    renderSidebar();

    await user.click(screen.getByRole('button', { name: 'New chat' }));
    await user.click(screen.getByRole('button', { name: 'Add contact' }));
    await user.type(screen.getByLabelText('Email'), 'erin@example.com');
    await user.click(screen.getByRole('button', { name: 'Find' }));
    await user.click(await screen.findByRole('button', { name: 'Open chat' }));

    await waitFor(() => {
        expect(screen.getByRole('status').textContent).toBe('/chat/c-Erin');
    });

    await user.click(screen.getByRole('button', { name: 'history back' }));

    await waitFor(() => {
        expect(screen.getByRole('status').textContent).toBe('/');
    });
    expect(screen.queryByRole('dialog', { name: 'Add contact' })).toBeNull();
});

// Кнопка, що перемкнула розділ, зникає — фокус переходить у пошук нового розділу, а не на body
test('switching sections on the desktop moves the focus to the new search', async () => {
    mockViewport(true);

    const user = userEvent.setup();

    renderSidebar();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByRole('menuitem', { name: 'Contacts' }));

    await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole('searchbox', { name: 'Search contacts' }));
    });

    await user.click(screen.getByRole('button', { name: 'Back to chats' }));

    await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole('searchbox', { name: 'Search' }));
    });
});

// На телефоні фокус у пошуку відкрив би клавіатуру: вкладки лишаються на місці, фокус теж
test('switching tabs on the phone does not focus the search', async () => {
    const user = userEvent.setup();

    renderSidebar();

    await user.click(screen.getByRole('button', { name: 'Contacts' }));

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Contacts' }));
});

test('Add contact opened from Chats on the phone goes back to chats', async () => {
    queries[ 'chats:list' ] = [];

    const user = userEvent.setup();

    renderSidebar();

    await user.click(screen.getByRole('button', { name: 'Add contact' }));

    expect(await screen.findByRole('button', { name: 'Back to chats' })).toBeTruthy();
});
