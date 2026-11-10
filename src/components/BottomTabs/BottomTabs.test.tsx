import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import BottomTabs from './BottomTabs';

// Артборд MobileChats: вкладки «Chats», «Contacts», «Settings» знизу, на «Chats» — лічильник непрочитаних
test('bottom tabs mark the current section and switch sections', async () => {
    const onSelect = vi.fn();

    renderWithProviders(
        <BottomTabs
            view="contacts"
            unread={ 0 }
            onSelect={ onSelect }
        />
    );

    const nav = screen.getByRole('navigation', { name: 'Sections' });

    expect(nav).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Contacts' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: 'Chats' }).getAttribute('aria-current')).toBeNull();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Settings' }));

    expect(onSelect).toHaveBeenCalledWith('settings');
});

test('the Chats tab caps the unread counter at 99+ and hides zero', () => {
    const { rerender } = renderWithProviders(
        <BottomTabs
            view="chats"
            unread={ 120 }
            onSelect={ vi.fn() }
        />
    );

    expect(screen.getByText('99+')).toBeTruthy();

    rerender(
        <BottomTabs
            view="chats"
            unread={ 0 }
            onSelect={ vi.fn() }
        />
    );

    expect(screen.getByRole('button', { name: 'Chats' }).textContent).toBe('Chats');
});
