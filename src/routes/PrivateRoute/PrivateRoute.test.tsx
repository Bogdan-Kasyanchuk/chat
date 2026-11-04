import { fireEvent, screen, waitFor } from '@testing-library/react';
import { ConvexError } from 'convex/values';
import { Component, type FC, type ReactNode } from 'react';
import { Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import SignInPage from '@/pages/SignInPage';
import { renderWithProviders } from '@/test/render';
import { NOT_SIGNED_IN } from '@convex/chatRules';

import PrivateRoute from './PrivateRoute';

const signIn = vi.fn();
const signOut = vi.fn();
const auth = vi.hoisted(() => ({ isAuthenticated: false, isLoading: false }));

vi.mock('convex/react', () => ({
    useConvexAuth: () => auth
}));

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signIn, signOut })
}));

afterEach(() => {
    signIn.mockReset();
    signOut.mockReset();
    auth.isAuthenticated = false;
    vi.restoreAllMocks();
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

const Throws: FC<{ error: Error }> = ({ error }) => {
    throw error;
};

class Outer extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        return this.state.failed ? <p>outer caught</p> : this.props.children;
    }
}

// Акаунт видалено (тут чи в іншій вкладці): живі запити кидають NOT_SIGNED_IN ще до виходу.
// Замість білого екрана — вихід, далі PrivateRoute сам веде на /login
test('a vanished session signs out instead of crashing the page', async () => {
    auth.isAuthenticated = true;
    signOut.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(
        <Outer>
            <PrivateRoute>
                <Throws error={ new ConvexError(NOT_SIGNED_IN) } />
            </PrivateRoute>
        </Outer>
    );

    await waitFor(() => {
        expect(signOut).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByText('outer caught')).toBeNull();
});

test('other errors are not taken for a lost session', () => {
    auth.isAuthenticated = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(
        <Outer>
            <PrivateRoute>
                <Throws error={ new ConvexError('Chat not found') } />
            </PrivateRoute>
        </Outer>
    );

    expect(screen.queryByText('outer caught')).not.toBeNull();
    expect(signOut).not.toHaveBeenCalled();
});
