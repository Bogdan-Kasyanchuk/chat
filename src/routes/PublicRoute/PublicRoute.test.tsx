import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import PublicRoute from './PublicRoute';

vi.mock('convex/react', () => ({
    useConvexAuth: () => ({ isAuthenticated: true, isLoading: false })
}));

// Після входу поштою людина йде туди, звідки прийшла, а не на головну
test('a signed-in visitor on an auth page goes back to where they came from', () => {
    renderWithProviders(
        <Routes>
            <Route
                path="/login"
                element={ <PublicRoute restricted><p>login page</p></PublicRoute> }
            />
            <Route
                path="/chat/:chatId"
                element={ <p>chat page</p> }
            />
        </Routes>,
        { route: { pathname: '/login', state: { from: '/chat/c1' } } }
    );

    expect(screen.getByText('chat page')).toBeTruthy();
});
