import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FunctionReference, getFunctionName } from 'convex/server';
import { Link, Route, Routes } from 'react-router';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { mockViewport } from '@/test/viewport';

import ChatLayout from './ChatLayout';

let chats: unknown[] = [];

vi.mock('convex/react', () => ({
    useQuery: (ref: FunctionReference<'query'>) => {
        const name = getFunctionName(ref);

        if (name === 'chats:list') {
            return chats;
        }

        return name === 'contacts:list' ? [] : null;
    },
    useMutation: () => vi.fn(),
    useAction: () => vi.fn(),
    useConvex: () => ({ query: vi.fn() })
}));

vi.mock('@convex-dev/auth/react', () => ({ useAuthActions: () => ({ signOut: vi.fn() }) }));
vi.mock('@/hooks/usePresenceHeartbeat', () => ({ default: () => {} }));
vi.mock('@/hooks/useIncomingNotifications', () => ({ default: () => {} }));

const renderLayout = (route: string) => renderWithProviders(
    <Routes>
        <Route element={ <ChatLayout /> }>
            <Route
                path="/"
                element={ null }
            />
            <Route
                path="/chat/:chatId"
                element={ <Link to="/">conversation</Link> }
            />
        </Route>
    </Routes>,
    { route }
);

// Рішення «Розкладка телефона»: розмова виїжджає поверх списку, а не замінює його
test('on a phone the conversation opens over the chat list, which becomes inert', async () => {
    mockViewport(false);
    const { container } = renderLayout('/chat/c1');

    const list = container.querySelector<HTMLElement>('[data-chat-list]');

    expect(screen.getByRole('main').textContent).toBe('conversation');
    expect(list).toBeTruthy();
    expect(list?.hasAttribute('inert')).toBe(true);

    await userEvent.setup().click(screen.getByRole('link', { name: 'conversation' }));

    await waitFor(() => {
        expect(screen.queryByRole('main')).toBeNull();
    });
    expect(list?.hasAttribute('inert')).toBe(false);
});

test('on a desktop the list and the conversation sit side by side', () => {
    mockViewport(true);
    renderLayout('/');

    expect(screen.getByRole('main').textContent).toBe('Select a chat to start messaging');
});

// Рев'ю етапу 5: після «назад» на телефоні фокус — на рядку щойно закритого чату, а не на body
test('on a phone leaving a chat puts the focus on its row in the list', async () => {
    mockViewport(false);
    chats = [ {
        chatId: 'c1',
        partner: { userId: 'u2', name: 'Bob', avatar: null, online: false, lastSeenAt: null, isContact: true },
        lastMessage: null,
        unread: 0,
        muted: false,
        lastMessageAt: 1
    } ];
    renderLayout('/chat/c1');

    await userEvent.setup().click(screen.getByRole('link', { name: 'conversation' }));

    await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole('link', { name: /Bob/ }));
    });
    chats = [];
});
