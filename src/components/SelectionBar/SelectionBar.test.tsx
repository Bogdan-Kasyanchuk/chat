import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import SelectionBar from './SelectionBar';

test('SelectionBar shows the count and its actions', async () => {
    const handlers = { onForward: vi.fn(), onCopy: vi.fn(), onDelete: vi.fn(), onCancel: vi.fn() };

    renderWithProviders(
        <SelectionBar
            count={ 3 }
            { ...handlers }
        />
    );

    const user = userEvent.setup();

    expect(screen.getByText('3 selected')).toBeTruthy();

    for (const [ name, handler ] of [
        [ 'Forward', handlers.onForward ],
        [ 'Copy', handlers.onCopy ],
        [ 'Delete', handlers.onDelete ],
        [ 'Cancel', handlers.onCancel ]
    ] as const) {
        await user.click(screen.getByRole('button', { name }));

        expect(handler).toHaveBeenCalledTimes(1);
    }
});
