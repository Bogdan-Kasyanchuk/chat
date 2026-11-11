import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import ScrollDownButton from './ScrollDownButton';

// Артборд ScrollDown: кругла кнопка 50 з бейджем непрочитаних; читач екрана чує «…, 2 unread»
test('the scroll down button names the unread count and shows it on a badge', async () => {
    const onClick = vi.fn();
    const { rerender } = renderWithProviders(
        <ScrollDownButton
            unread={ 2 }
            visible
            onClick={ onClick }
        />
    );

    const button = screen.getByRole('button', { name: 'Scroll to the newest message, 2 unread' });

    expect(within(button).getByText('2')).toBeTruthy();

    await userEvent.setup().click(button);

    expect(onClick).toHaveBeenCalled();

    rerender(
        <ScrollDownButton
            unread={ 0 }
            visible
            onClick={ onClick }
        />
    );

    expect(screen.getByRole('button', { name: 'Scroll to the newest message' })).toBeTruthy();
});
