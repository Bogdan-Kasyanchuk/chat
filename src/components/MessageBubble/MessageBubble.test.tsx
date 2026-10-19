import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { MessageView } from '@/types/chat';

import MessageBubble from './MessageBubble';

const makeMessage = (patch: Partial<MessageView> = {}): MessageView => ({
    id: 'm1' as MessageView[ 'id' ],
    body: 'Hello\nthere',
    createdAt: new Date(2026, 9, 18, 9, 5).getTime(),
    authorIsMe: true,
    editedAt: null,
    forwardedFrom: null,
    replyTo: null,
    read: false,
    ...patch
});

test('MessageBubble shows forwarded, reply quote, edited and read ticks', async () => {
    const onQuoteClick = vi.fn();
    const { unmount } = renderWithProviders(
        <MessageBubble
            message={ makeMessage({
                forwardedFrom: 'Carol',
                replyTo: { id: 'm0' as MessageView[ 'id' ], authorName: 'Bob', body: 'Lunch?' },
                editedAt: 1,
                read: true
            }) }
            partnerName="Bob"
            onQuoteClick={ onQuoteClick }
        />
    );

    expect(screen.getByText('Forwarded from Carol')).toBeTruthy();
    expect(screen.getByText('Lunch?')).toBeTruthy();
    expect(screen.getByText('edited')).toBeTruthy();
    expect(screen.getByText('09:05')).toBeTruthy();
    expect(screen.getByLabelText('Read')).toBeTruthy();
    expect(screen.getByText(/Hello/).textContent).toBe('Hello\nthere');

    await userEvent.setup().click(screen.getByRole('button', { name: /Bob/ }));

    expect(onQuoteClick).toHaveBeenCalledWith('m0');

    unmount();
    renderWithProviders(
        <MessageBubble
            message={ makeMessage() }
            partnerName="Bob"
        />
    );

    expect(screen.getByLabelText('Sent')).toBeTruthy();
    expect(screen.queryByText('edited')).toBeNull();
    expect(screen.queryByText(/Forwarded/)).toBeNull();
});

test('MessageBubble shows no ticks on the partner\'s messages', () => {
    renderWithProviders(
        <MessageBubble
            message={ makeMessage({ authorIsMe: false, read: true }) }
            partnerName="Bob"
        />
    );

    expect(screen.queryByLabelText('Read')).toBeNull();
    expect(screen.queryByLabelText('Sent')).toBeNull();
    expect(screen.getByRole('article', { name: 'Bob' }).dataset.mine).toBeUndefined();
});

test('MessageBubble renders a deleted reply as Deleted message', () => {
    renderWithProviders(
        <MessageBubble
            message={ makeMessage({ replyTo: { id: null, authorName: '', body: 'Deleted message' } }) }
            partnerName="Bob"
            onQuoteClick={ vi.fn() }
        />
    );

    expect(screen.getByText('Deleted message')).toBeTruthy();
    // Оригіналу немає — цитата не клікабельна
    expect(screen.queryByRole('button')).toBeNull();
});
