import { act, createEvent, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { mockViewport } from '@/test/viewport';
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

const sheet = () => screen.queryByRole('dialog', { name: 'Message actions' });

// jsdom перетворює touches на звичайний масив, а mantine-contextmenu читає touches.item(0)
const touch = (target: HTMLElement, type: 'touchStart' | 'touchMove' | 'touchEnd', x: number) => {
    const event = createEvent[ type ](target);
    const point = { clientX: x, clientY: 10 };
    const list = Object.assign([ point ], { item: () => point });

    Object.defineProperties(event, { touches: { value: list }, changedTouches: { value: list } });
    fireEvent(target, event);
};

const longPress = (target: HTMLElement) => {
    touch(target, 'touchStart', 10);
    act(() => {
        vi.advanceTimersByTime(400);
    });
    touch(target, 'touchEnd', 10);
};

afterEach(() => {
    // Довге натискання лишає на секунду слухача, що ковтає наступний contextmenu: прибираємо його до наступного тесту
    if (vi.isFakeTimers()) {
        vi.runOnlyPendingTimers();
    }

    vi.useRealTimers();
});

test('MessageMenu opens on right click with every action for my message', async () => {
    mockViewport(true);

    const onAction = renderMenu();

    fireEvent.contextMenu(screen.getByText('Hello'));

    expect(titles()).toEqual([ 'Reply', 'Edit', 'Copy text', 'Forward', 'Select', 'Delete' ]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Forward' }));

    expect(onAction).toHaveBeenCalledWith('forward');
});

test('MessageMenu hides Reply and Edit when the chat is read-only', () => {
    mockViewport(true);
    renderMenu({ canSend: false });
    fireEvent.contextMenu(screen.getByText('Hello'));

    expect(titles()).toEqual([ 'Copy text', 'Forward', 'Select', 'Delete' ]);
});

test('MessageMenu stays closed while disabled and keeps the browser menu away too', () => {
    mockViewport(true);
    renderMenu({ disabled: true });

    // fireEvent повертає false, якщо обробник викликав preventDefault
    expect(fireEvent.contextMenu(screen.getByText('Hello'))).toBe(false);
    expect(titles()).toEqual([]);
});

test('MessageMenu opens on a 400 ms long press and not when the finger moves', () => {
    mockViewport(true);
    vi.useFakeTimers();
    renderMenu();

    const target = screen.getByText('Hello');

    touch(target, 'touchStart', 10);
    touch(target, 'touchMove', 40);
    act(() => {
        vi.advanceTimersByTime(500);
    });

    expect(titles()).toEqual([]);

    touch(target, 'touchEnd', 40);
    touch(target, 'touchStart', 10);
    act(() => {
        vi.advanceTimersByTime(399);
    });

    expect(titles()).toEqual([]);

    act(() => {
        vi.advanceTimersByTime(1);
    });

    expect(titles()).toContain('Reply');
});

test('on a phone a long press opens the bottom sheet instead of the context menu', () => {
    vi.useFakeTimers();
    renderMenu({ message: makeMessage({ body: 'See you at 10:30', editedAt: 2 }) });

    const target = screen.getByText('Hello');

    touch(target, 'touchStart', 10);
    touch(target, 'touchMove', 40);
    act(() => {
        vi.advanceTimersByTime(500);
    });

    expect(sheet()).toBeNull();

    touch(target, 'touchEnd', 40);
    longPress(target);

    const dialog = sheet();

    expect(dialog).not.toBeNull();
    expect(document.querySelector('.mantine-contextmenu')).toBeNull();
    // Прев'ю повідомлення над пунктами, як на MobileActions
    expect(within(dialog!).getByText('See you at 10:30').textContent).toBe('See you at 10:30');
    expect(within(dialog!).queryByText('edited')).not.toBeNull();
});

test('the sheet offers the same actions as the desktop menu', async () => {
    vi.useFakeTimers();

    const onAction = renderMenu();

    longPress(screen.getByText('Hello'));

    const dialog = sheet()!;

    expect(within(dialog).getAllByRole('button').map(button => button.textContent)).toEqual([ 'Reply', 'Edit', 'Copy text', 'Forward', 'Select', 'Delete' ]);

    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    await userEvent.setup().click(within(dialog).getByRole('button', { name: 'Forward' }));

    expect(onAction).toHaveBeenCalledWith('forward');
    expect(sheet()).toBeNull();
});

test('the sheet of a read-only chat has no Reply and Edit', () => {
    vi.useFakeTimers();
    renderMenu({ canSend: false });
    longPress(screen.getByText('Hello'));

    expect(within(sheet()!).getAllByRole('button').map(button => button.textContent)).toEqual([ 'Copy text', 'Forward', 'Select', 'Delete' ]);
});

test('on a phone a right click opens the sheet and not the browser menu', () => {
    renderMenu();

    // Android після довгого натискання шле й contextmenu; миша на вузькому екрані — так само
    expect(fireEvent.contextMenu(screen.getByText('Hello'))).toBe(false);
    expect(sheet()).not.toBeNull();
    expect(document.querySelector('.mantine-contextmenu')).toBeNull();
});
