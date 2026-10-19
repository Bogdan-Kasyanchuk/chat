import { notifications } from '@mantine/notifications';
import { renderHook } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

import { playSound } from '@/lib/sounds';
import type { ChatSummary } from '@/types/chat';

import useIncomingNotifications from './useIncomingNotifications';

const navigate = vi.fn();
let visibility: 'hidden' | 'visible' = 'visible';

vi.mock('convex/react', () => ({ useQuery: () => ({ sound: 'pop' }) }));
vi.mock('react-router', () => ({ useNavigate: () => navigate }));
vi.mock('@mantine/hooks', async importOriginal => ({
    ...await importOriginal<typeof import('@mantine/hooks')>(),
    useDocumentVisibility: () => visibility
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn(), hide: vi.fn() } }));
vi.mock('@/lib/sounds', () => ({ playSound: vi.fn() }));

const chat = (id: string, messageId: string, muted = false) => ({
    chatId: id,
    muted,
    partner: { name: `Partner ${ id }`, avatar: null },
    lastMessage: { id: messageId, body: `text ${ messageId }`, authorIsMe: false, createdAt: 1, read: true }
}) as unknown as ChatSummary;

beforeEach(() => {
    vi.clearAllMocks();
    visibility = 'visible';
});

test('shows one toast per incoming chat and plays the sound once', () => {
    const { rerender } = renderHook(({ chats }) => useIncomingNotifications(chats, 'open'), {
        initialProps: { chats: [ chat('a', '1'), chat('b', '1') ] }
    });

    expect(notifications.show).not.toHaveBeenCalled();

    rerender({ chats: [ chat('a', '2'), chat('b', '2') ] });

    expect(notifications.show).toHaveBeenCalledTimes(2);
    expect(playSound).toHaveBeenCalledTimes(1);
    expect(playSound).toHaveBeenCalledWith('pop');
});

test('toast click hides it and opens the chat', () => {
    const { rerender } = renderHook(({ chats }) => useIncomingNotifications(chats, null), {
        initialProps: { chats: [ chat('a', '1') ] }
    });

    rerender({ chats: [ chat('a', '2') ] });

    const { onClick, id } = vi.mocked(notifications.show).mock.calls[ 0 ][ 0 ];

    onClick?.({} as never);

    expect(notifications.hide).toHaveBeenCalledWith(id);
    expect(navigate).toHaveBeenCalledWith('/chat/a');
});

test('muted and open visible chats stay silent', () => {
    const { rerender } = renderHook(({ chats }) => useIncomingNotifications(chats, 'a'), {
        initialProps: { chats: [ chat('a', '1'), chat('b', '1', true) ] }
    });

    rerender({ chats: [ chat('a', '2'), chat('b', '2', true) ] });

    expect(notifications.show).not.toHaveBeenCalled();
    expect(playSound).not.toHaveBeenCalled();
});
