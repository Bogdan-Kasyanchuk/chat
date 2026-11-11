import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { mockViewport } from '@/test/viewport';

import SelectionBar, { SelectionActions } from './SelectionBar';

const handlers = () => ({ onForward: vi.fn(), onCopy: vi.fn(), onDelete: vi.fn(), onCancel: vi.fn() });

test('on a desktop SelectionBar shows the count and labelled actions', async () => {
    mockViewport(true);

    const props = handlers();

    renderWithProviders(
        <SelectionBar
            count={ 3 }
            { ...props }
        />
    );

    const user = userEvent.setup();
    const bar = screen.getByRole('banner');

    expect(within(bar).getByText('3 selected')).toBeTruthy();

    for (const [ name, handler ] of [
        [ 'Forward', props.onForward ],
        [ 'Copy', props.onCopy ],
        [ 'Delete', props.onDelete ],
        [ 'Cancel selection', props.onCancel ]
    ] as const) {
        const button = within(bar).getByRole('button', { name });

        await user.click(button);

        expect(handler).toHaveBeenCalledTimes(1);
    }

    // Артборд Selection: підписи на кнопках, а не лише іконки
    expect(within(bar).getByRole('button', { name: 'Forward' }).textContent).toBe('Forward');
});

test('on a phone the header has only Cancel selection and the count', () => {
    renderWithProviders(
        <SelectionBar
            count={ 2 }
            { ...handlers() }
        />
    );

    const bar = screen.getByRole('banner');

    expect(within(bar).getByText('2 selected')).toBeTruthy();
    expect(within(bar).getAllByRole('button').map(button => button.getAttribute('aria-label') ?? button.textContent)).toEqual([ 'Cancel selection' ]);
});

test('on a phone SelectionActions offers Forward, Copy and Delete with an icon over the label', async () => {
    const props = handlers();

    renderWithProviders(<SelectionActions { ...props } />);

    const toolbar = screen.getByRole('toolbar', { name: 'Selected messages' });
    const buttons = within(toolbar).getAllByRole('button');

    expect(buttons.map(button => button.textContent)).toEqual([ 'Forward', 'Copy', 'Delete' ]);
    expect(buttons[ 2 ].hasAttribute('data-danger')).toBe(true);

    const user = userEvent.setup();

    await user.click(buttons[ 0 ]);
    await user.click(buttons[ 1 ]);
    await user.click(buttons[ 2 ]);

    expect([ props.onForward, props.onCopy, props.onDelete ].map(handler => handler.mock.calls.length)).toEqual([ 1, 1, 1 ]);
});
