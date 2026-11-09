import { Button } from '@mantine/core';
import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { renderWithProviders } from '@/test/render';

import EmptyState from './EmptyState';

// Порожній стан з канвасу: іконка в колі 80, заголовок 20 / 700, текст 14, pill-кнопка 44
test('shows the icon, a heading, the text and the action', () => {
    renderWithProviders(
        <EmptyState
            icon={ <svg data-testid="icon" /> }
            title="No chats yet"
            text="Add a contact by email to start talking."
            action={ <Button>Add contact</Button> }
        />
    );

    expect(screen.getByTestId('icon')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'No chats yet' })).toBeTruthy();
    expect(screen.getByText('Add a contact by email to start talking.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add contact' })).toBeTruthy();
});

test('the text and the action are optional', () => {
    const { container } = renderWithProviders(
        <EmptyState
            icon={ <svg /> }
            title="Nothing found"
        />
    );

    expect(screen.getByRole('heading', { name: 'Nothing found' })).toBeTruthy();
    expect(container.querySelectorAll('p')).toHaveLength(0);
    expect(screen.queryByRole('button')).toBeNull();
});
