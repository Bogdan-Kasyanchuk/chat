import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { ChatSummary } from '@/types/chat';

import ChatListItem from './ChatListItem';

const now = new Date(2026, 9, 18, 15, 0).getTime();

const makeChat = (patch: Partial<ChatSummary> = {}): ChatSummary => ({
    chatId: 'c1' as ChatSummary[ 'chatId' ],
    partner: { userId: 'u2' as never, name: 'Bob', avatar: null, online: false, lastSeenAt: null, isContact: true },
    lastMessage: {
        id: 'm1' as never,
        body: 'See you',
        authorIsMe: true,
        createdAt: new Date(2026, 9, 18, 14, 2).getTime(),
        read: true
    },
    unread: 0,
    muted: false,
    lastMessageAt: 1,
    ...patch
});

test('ChatListItem shows You: prefix, read ticks and a capped unread badge', () => {
    renderWithProviders(
        <ChatListItem
            chat={ makeChat({ unread: 120 }) }
            active={ false }
            now={ now }
        />
    );

    expect(screen.getByText('You: See you')).toBeTruthy();
    expect(screen.getByText('14:02')).toBeTruthy();
    expect(screen.getByLabelText('Read')).toBeTruthy();
    expect(screen.getByText('99+')).toBeTruthy();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/chat/c1');
});

test('ChatListItem shows a single tick for an unread message and no prefix for the partner', () => {
    const { unmount } = renderWithProviders(
        <ChatListItem
            chat={ makeChat({ lastMessage: { ...makeChat().lastMessage!, read: false } }) }
            now={ now }
            active
        />
    );

    expect(screen.getByLabelText('Sent')).toBeTruthy();
    expect(screen.getByRole('link').hasAttribute('data-active')).toBe(true);

    unmount();
    renderWithProviders(
        <ChatListItem
            chat={ makeChat({ lastMessage: { ...makeChat().lastMessage!, authorIsMe: false } }) }
            active={ false }
            now={ now }
        />
    );

    expect(screen.queryByLabelText('Sent')).toBeNull();
});

test('ChatListItem greys the badge of a muted chat', () => {
    renderWithProviders(
        <ChatListItem
            chat={ makeChat({ unread: 3, muted: true }) }
            active={ false }
            now={ now }
        />
    );

    expect(screen.getByText('3').closest('.mantine-Badge-root')?.hasAttribute('data-muted')).toBe(true);
    expect(screen.getByLabelText('Muted')).toBeTruthy();
});

test('ChatListItem keeps the badge of an unmuted chat in the accent colour', () => {
    renderWithProviders(
        <ChatListItem
            chat={ makeChat({ unread: 3 }) }
            active={ false }
            now={ now }
        />
    );

    expect(screen.getByText('3').closest('.mantine-Badge-root')?.hasAttribute('data-muted')).toBe(false);
    expect(screen.queryByLabelText('Muted')).toBeNull();
});

// Артборд Chats: ім'я, галочки й час — у верхньому рядку, превʼю й лічильник — у нижньому
test('ticks and time sit on the name row and the badge on the preview row', () => {
    renderWithProviders(
        <ChatListItem
            chat={ makeChat({ unread: 3 }) }
            active={ false }
            now={ now }
        />
    );

    const nameRow = screen.getByText('Bob').parentElement!;
    const previewRow = screen.getByText('You: See you').parentElement!;

    expect(nameRow.contains(screen.getByLabelText('Read'))).toBe(true);
    expect(nameRow.contains(screen.getByText('14:02'))).toBe(true);
    expect(previewRow.contains(screen.getByText('3'))).toBe(true);
});

test('the unread badge takes the badge token instead of a Mantine colour', () => {
    renderWithProviders(
        <ChatListItem
            chat={ makeChat({ unread: 3 }) }
            active={ false }
            now={ now }
        />
    );

    const badge = screen.getByText('3').closest('.mantine-Badge-root') as HTMLElement;

    expect(badge.style.getPropertyValue('--badge-bg')).toBe('var(--chat-badge)');
});

test('the avatar in the chat list is 44px', () => {
    renderWithProviders(
        <ChatListItem
            chat={ makeChat() }
            active={ false }
            now={ now }
        />
    );

    const avatar = screen.getByText('B').closest('.mantine-Avatar-root') as HTMLElement;

    expect(avatar.style.getPropertyValue('--avatar-size')).toContain('2.75rem');
});
