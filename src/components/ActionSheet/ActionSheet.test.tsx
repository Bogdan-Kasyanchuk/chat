import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import ActionSheet, { type ActionSheetItem } from './ActionSheet';

const items = (onClick = vi.fn()): ActionSheetItem[] => [
    { key: 'mute', label: 'Mute notifications', icon: null, onClick },
    { key: 'clear', label: 'Clear history', icon: null, dividerBefore: true, onClick },
    { key: 'delete', label: 'Delete chat', icon: null, danger: true, onClick }
];

const renderSheet = (props: Partial<Parameters<typeof ActionSheet>[ 0 ]> = {}) => {
    const onClose = vi.fn();

    renderWithProviders(
        <ActionSheet
            title="Chat settings"
            items={ items() }
            opened
            onClose={ onClose }
            { ...props }
        />
    );

    return onClose;
};

test('the sheet is a named dialog with a handle, plain buttons and a divider', () => {
    renderSheet();

    const dialog = screen.getByRole('dialog', { name: 'Chat settings' });

    expect(within(dialog).getByTestId('sheet-handle')).toBeTruthy();
    expect(within(dialog).queryByRole('menu')).toBeNull();
    expect(within(dialog).getAllByRole('button').map(button => button.textContent)).toEqual([ 'Mute notifications', 'Clear history', 'Delete chat' ]);
    expect(within(dialog).getAllByRole('separator')).toHaveLength(1);
    expect(within(dialog).getByRole('button', { name: 'Delete chat' }).hasAttribute('data-danger')).toBe(true);
});

test('an item closes the sheet and runs its action', async () => {
    const onClick = vi.fn();
    const onClose = renderSheet({ items: items(onClick) });

    await userEvent.setup().click(screen.getByRole('button', { name: 'Clear history' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
});

test('as a menu the arrow keys, Home and End move between the items', async () => {
    renderSheet({ asMenu: true });

    const user = userEvent.setup();
    const menu = screen.getByRole('menu', { name: 'Chat settings' });
    const [ mute, clear, remove ] = within(menu).getAllByRole('menuitem');

    mute.focus();
    await user.keyboard('{ArrowDown}');

    expect(document.activeElement).toBe(clear);

    await user.keyboard('{ArrowDown}{ArrowDown}');

    // По колу: з останнього — на перший
    expect(document.activeElement).toBe(mute);

    await user.keyboard('{ArrowUp}');

    expect(document.activeElement).toBe(remove);

    await user.keyboard('{Home}');

    expect(document.activeElement).toBe(mute);

    await user.keyboard('{End}');

    expect(document.activeElement).toBe(remove);
});
