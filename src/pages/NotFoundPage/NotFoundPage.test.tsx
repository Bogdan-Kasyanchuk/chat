import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { expect, test } from 'vitest';

import { renderWithProviders } from '@/test/render';

import NotFoundPage from './NotFoundPage';

// Тексти — блок «404 · empty state style» на аркуші Components
test('explains the page is missing and leads back to the chats', async () => {
    renderWithProviders(
        <Routes>
            <Route
                path="/"
                element={ <p>chats page</p> }
            />
            <Route
                path="*"
                element={ <NotFoundPage /> }
            />
        </Routes>,
        { route: '/nope' }
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy();
    expect(screen.getByText('The link is broken or the page was removed.')).toBeTruthy();

    await userEvent.setup().click(screen.getByRole('link', { name: 'Back to chats' }));

    expect(screen.getByText('chats page')).toBeTruthy();
});
