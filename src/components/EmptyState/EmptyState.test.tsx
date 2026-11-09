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

// Порожній стан у панелі — h3; на окремій сторінці (404) він єдиний заголовок, тож рівень задає сторінка, а вигляд той самий
test('the heading level can be raised for a page of its own', () => {
    renderWithProviders(
        <EmptyState
            icon={ <svg /> }
            title="Page not found"
            headingOrder={ 1 }
        />
    );

    const heading = screen.getByRole('heading', { level: 1, name: 'Page not found' });

    expect(heading.style.getPropertyValue('--title-fz')).toBe('var(--mantine-h3-font-size)');
});

test('by default the heading is an h3', () => {
    renderWithProviders(
        <EmptyState
            icon={ <svg /> }
            title="No chats yet"
        />
    );

    expect(screen.getByRole('heading', { level: 3, name: 'No chats yet' })).toBeTruthy();
});
