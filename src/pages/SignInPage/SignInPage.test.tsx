import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvexError } from 'convex/values';
import { Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { EMAIL_LINKED_TO_GOOGLE, TOO_MANY_ATTEMPTS } from '@convex/authRules';

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

// Тексти з артбордів Main і MobileSignIn
test('greets the person and offers to create an account', async () => {
    renderWithProviders(
        <Routes>
            <Route
                path="/login"
                element={ <SignInPage /> }
            />
            <Route
                path="/signup"
                element={ <p>sign-up page</p> }
            />
        </Routes>,
        { route: '/login' }
    );

    expect(screen.getByText('Welcome back. Pick up where you left off.')).toBeTruthy();
    expect(screen.getByLabelText('Email').getAttribute('placeholder')).toBe('you@example.com');

    await userEvent.setup().click(screen.getByRole('link', { name: 'Create account' }));

    expect(screen.getByText('sign-up page')).toBeTruthy();
});

// На канвасі помилка входу стоїть під полем пароля, а саме поле — з червоною рамкою
test('a server error marks the password field and is announced', async () => {
    signIn.mockRejectedValue(new ConvexError('Wrong email or password'));

    renderSignIn();
    await fillAndSubmit('alice@example.com', 'wrong-pass');

    expect((await screen.findByRole('alert')).textContent).toBe('Wrong email or password');
    expect(screen.getByLabelText('Password').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).not.toBe('true');
});

test('typing a new password clears the server error', async () => {
    signIn.mockRejectedValue(new ConvexError('Wrong email or password'));

    renderSignIn();
    await fillAndSubmit('alice@example.com', 'wrong-pass');
    await screen.findByRole('alert');
    await userEvent.setup().type(screen.getByLabelText('Password'), 'x');

    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByLabelText('Password').getAttribute('aria-invalid')).not.toBe('true');
});

// Червоне поле пароля — лише коли сервер каже, що пошта чи пароль невірні; збій мережі, ліміт спроб чи
// «пошта прив'язана до Google» — окремим рядком, без натяку, що пароль неправильний
test.each([
    [ 'a network failure', new Error('fetch failed'), 'Could not sign in. Try again' ],
    [ 'too many attempts', new ConvexError(TOO_MANY_ATTEMPTS), TOO_MANY_ATTEMPTS ],
    [ 'an email linked to Google', new ConvexError(EMAIL_LINKED_TO_GOOGLE), EMAIL_LINKED_TO_GOOGLE ]
])('%s is announced without marking the password field', async (_, error, message) => {
    signIn.mockRejectedValue(error);

    renderSignIn();
    await fillAndSubmit('alice@example.com', 'secret123');

    expect((await screen.findByRole('alert')).textContent).toBe(message);
    expect(screen.getByLabelText('Password').getAttribute('aria-invalid')).not.toBe('true');
});
