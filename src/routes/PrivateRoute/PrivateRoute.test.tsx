import { fireEvent, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import SignInPage from '@/pages/SignInPage';
import { renderWithProviders } from '@/test/render';

import PrivateRoute from './PrivateRoute';

const signIn = vi.fn();

vi.mock('convex/react', () => ({
    useConvexAuth: () => ({ isAuthenticated: false, isLoading: false })
}));

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signIn })
}));

afterEach(() => {
    signIn.mockReset();
});

// Пряме посилання на чат без логіну: після входу Google повертає в той самий чат
test('sends the original chat link, query included, as the sign-in redirect', () => {
    signIn.mockResolvedValue({ signingIn: false });

    renderWithProviders(
        <Routes>
            <Route
                path="/chat/:chatId"
                element={ <PrivateRoute><p>chat page</p></PrivateRoute> }
            />
            <Route
                path="/login"
                element={ <SignInPage /> }
            />
        </Routes>,
        { route: '/chat/c1?x=1' }
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    expect(signIn).toHaveBeenCalledWith('google', { redirectTo: `${ window.location.origin }/chat/c1?x=1` });
});
