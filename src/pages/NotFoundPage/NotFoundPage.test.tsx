import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { expect, test } from 'vitest';

import { renderWithProviders } from '@/test/render';

import NotFoundPage from './NotFoundPage';

test('explains the page is missing and leads back home', async () => {
    renderWithProviders(
        <Routes>
            <Route
                path="/"
                element={ <p>home page</p> }
            />
            <Route
                path="*"
                element={ <NotFoundPage /> }
            />
        </Routes>,
        { route: '/nope' }
    );

    expect(screen.getByText('Something is not right...')).toBeTruthy();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Back to home page' }));

    expect(screen.getByText('home page')).toBeTruthy();
});
