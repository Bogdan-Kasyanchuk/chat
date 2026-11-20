import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import MainMenu from './MainMenu';

// Артборд MainMenu: кнопка ☰ у шапці бічної панелі, пункти «Chats», «Contacts», «Settings»
test('the main menu has Chats, Contacts and Settings', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
        <MainMenu
            view="chats"
            onSelect={ onSelect }
        />
    );

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    const items = screen.getAllByRole('menuitem').map(item => item.textContent);

    expect(items).toEqual([ 'Chats', 'Contacts', 'Settings' ]);
    // Поточний розділ позначено
    expect(screen.getByRole('menuitem', { name: 'Chats' }).getAttribute('aria-current')).toBe('page');

    await user.click(screen.getByRole('menuitem', { name: 'Contacts' }));

    expect(onSelect).toHaveBeenCalledWith('contacts');
});
