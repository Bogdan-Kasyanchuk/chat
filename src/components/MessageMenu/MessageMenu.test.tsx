import { act, createEvent, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { MessageView } from '@/types/chat';

import MessageMenu from './MessageMenu';

const makeMessage = (patch: Partial<MessageView> = {}): MessageView => ({
    id: 'm1' as MessageView[ 'id' ],
    body: 'Hello',
    createdAt: 1,
    authorIsMe: true,
    editedAt: null,
    forwardedFrom: null,
    replyTo: null,
    read: false,
    ...patch
});

const renderMenu = (patch: Partial<Parameters<typeof MessageMenu>[ 0 ]> = {}) => {
    const onAction = vi.fn();

    renderWithProviders(
        <MessageMenu
            message={ makeMessage() }
            canSend
            onAction={ onAction }
            { ...patch }
        >
            <p>Hello</p>
        </MessageMenu>
    );

    return onAction;
};

const titles = () => screen.queryAllByRole('button').map(button => button.textContent);

afterEach(() => {
    vi.useRealTimers();
});

test('MessageMenu opens on right click with every action for my message', async () => {
    const onAction = renderMenu();

    fireEvent.contextMenu(screen.getByText('Hello'));

    expect(titles()).toEqual([ 'Reply', 'Edit', 'Copy text', 'Forward', 'Select', 'Delete' ]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Forward' }));

    expect(onAction).toHaveBeenCalledWith('forward');
});

test('MessageMenu hides Reply and Edit when the chat is read-only and opens nothing when disabled', () => {
    renderMenu({ canSend: false });
    fireEvent.contextMenu(screen.getByText('Hello'));

    expect(titles()).toEqual([ 'Copy text', 'Forward', 'Select', 'Delete' ]);
});

test('MessageMenu stays closed while disabled', () => {
    renderMenu({ disabled: true });
    fireEvent.contextMenu(screen.getByText('Hello'));

    expect(titles()).toEqual([]);
});

test('MessageMenu opens on a 400 ms long press and not when the finger moves', () => {
    vi.useFakeTimers();
    renderMenu();

    const target = screen.getByText('Hello');
    // jsdom перетворює touches на звичайний масив, а mantine-contextmenu читає touches.item(0)
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', x: number) => {
        const event = createEvent[ type ](target);
        const point = { clientX: x, clientY: 10 };
        const list = Object.assign([ point ], { item: () => point });

        Object.defineProperties(event, { touches: { value: list }, changedTouches: { value: list } });
        fireEvent(target, event);
    };

    touch('touchStart', 10);
    touch('touchMove', 40);
    act(() => {
        vi.advanceTimersByTime(500);
    });

    expect(titles()).toEqual([]);

    touch('touchEnd', 40);
    touch('touchStart', 10);
    act(() => {
        vi.advanceTimersByTime(399);
    });

    expect(titles()).toEqual([]);

    act(() => {
        vi.advanceTimersByTime(1);
    });

    expect(titles()).toContain('Reply');
});
