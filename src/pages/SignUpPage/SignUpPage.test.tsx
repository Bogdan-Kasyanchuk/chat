import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvexError } from 'convex/values';
import { Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { EMAIL_TAKEN } from '@convex/authRules';

import SignUpPage from './SignUpPage';

const signIn = vi.fn();

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signIn })
}));

const renderSignUp = () => renderWithProviders(
    <Routes>
        <Route
            path="/signup"
            element={ <SignUpPage /> }
        />
        <Route
            path="/chat/:chatId"
            element={ <p>chat page</p> }
        />
    </Routes>,
    { route: { pathname: '/signup', state: { from: '/chat/c1' } } }
);

const fill = async ({ name, email, password, confirm = password }: { name: string, email: string, password: string, confirm?: string }) => {
    const user = userEvent.setup();

    if (name) {
        await user.type(screen.getByLabelText('Name'), name);
    }

    await user.type(screen.getByLabelText('Email'), email);
    await user.type(screen.getByLabelText('Password'), password);
    await user.type(screen.getByLabelText('Confirm password'), confirm);
    await user.click(screen.getByRole('button', { name: 'Create account' }));
};

afterEach(() => {
    signIn.mockReset();
});

test('requires a name and matching passwords before calling the server', async () => {
    renderSignUp();
    await fill({ name: '', email: 'alice@example.com', password: 'secret123', confirm: 'secret124' });

    expect(await screen.findByText('Name is required')).toBeTruthy();
    expect(screen.getByText('Passwords do not match')).toBeTruthy();
    expect(signIn).not.toHaveBeenCalled();
});

test('a short password is rejected before calling the server', async () => {
    renderSignUp();
    await fill({ name: 'Alice', email: 'alice@example.com', password: 'short' });

    expect(await screen.findByText('Password must be at least 8 characters')).toBeTruthy();
    expect(signIn).not.toHaveBeenCalled();
});

test('signs up with a trimmed name and lowercased email and returns to the original page', async () => {
    signIn.mockResolvedValue({ signingIn: true });

    renderSignUp();
    await fill({ name: '  Alice  ', email: ' Alice@Example.com ', password: 'secret123' });

    expect(signIn).toHaveBeenCalledWith('password', {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'secret123',
        flow: 'signUp'
    });
    expect(await screen.findByText('chat page')).toBeTruthy();
});

test('keeps the fields after a server error', async () => {
    signIn.mockRejectedValue(new ConvexError(EMAIL_TAKEN));

    renderSignUp();
    await fill({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });

    expect(await screen.findByText(EMAIL_TAKEN)).toBeTruthy();
    expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('alice@example.com');
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Alice');
});
