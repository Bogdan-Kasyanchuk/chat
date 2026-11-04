import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvexError } from 'convex/values';
import { Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import SignInPage from './SignInPage';

const signIn = vi.fn();

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signIn })
}));

const renderSignIn = () => renderWithProviders(
    <Routes>
        <Route
            path="/login"
            element={ <SignInPage /> }
        />
        <Route
            path="/chat/:chatId"
            element={ <p>chat page</p> }
        />
    </Routes>,
    { route: { pathname: '/login', state: { from: '/chat/c1' } } }
);

const fillAndSubmit = async (email: string, password: string) => {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), email);
    await user.type(screen.getByLabelText('Password'), password);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
};

afterEach(() => {
    signIn.mockReset();
});

test('signs in with email and password and returns to the original page', async () => {
    signIn.mockResolvedValue({ signingIn: true });

    renderSignIn();
    await fillAndSubmit(' Alice@Example.com ', 'secret123');

    expect(signIn).toHaveBeenCalledWith('password', { email: 'alice@example.com', password: 'secret123', flow: 'signIn' });
    expect(await screen.findByText('chat page')).toBeTruthy();
});

test('a wrong password shows the server message and stays on the page', async () => {
    signIn.mockRejectedValue(new ConvexError('Wrong email or password'));

    renderSignIn();
    await fillAndSubmit('alice@example.com', 'wrong-pass');

    expect(await screen.findByText('Wrong email or password')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
});

test('an invalid email is caught before calling the server', async () => {
    renderSignIn();
    await fillAndSubmit('not-an-email', 'secret123');

    expect(await screen.findByText('Enter a valid email')).toBeTruthy();
    expect(signIn).not.toHaveBeenCalled();
});

test('Google sign-in redirects back to the original page', async () => {
    signIn.mockResolvedValue({ signingIn: false });

    renderSignIn();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Continue with Google' }));

    expect(signIn).toHaveBeenCalledWith('google', { redirectTo: `${ window.location.origin }/chat/c1` });
});
