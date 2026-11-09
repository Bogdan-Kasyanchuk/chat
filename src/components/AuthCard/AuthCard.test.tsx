import { screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import AuthCard from './AuthCard';

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signIn: vi.fn() })
}));

const renderCard = () => renderWithProviders(
    <AuthCard
        title="Sign in"
        subtitle="Welcome back. Pick up where you left off."
        googleLabel="Continue with Google"
        showcase="messages"
        footer={ <p>footer</p> }
    >
        <p>form</p>
    </AuthCard>
);

// Текст розділювача — з канвасу (Main, SignUp, MobileSignIn, MobileSignUp)
test('the divider between Google and the form says or with email', () => {
    renderCard();

    expect(screen.queryByText('or with email')).not.toBeNull();
});

test('the screen has one main heading with its subtitle', () => {
    renderCard();

    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeTruthy();
    expect(screen.getByText('Welcome back. Pick up where you left off.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy();
    expect(screen.getByText('form')).toBeTruthy();
    expect(screen.getByText('footer')).toBeTruthy();
});

// Десктоп — вітрина ліворуч і форма праворуч; телефон — знак над заголовком, вітрини немає (ховає CSS)
test('the showcase sits beside the form and the phone gets the logo above the heading', () => {
    renderCard();

    expect(screen.getByText('Messages that arrive the moment they are sent.')).toBeTruthy();
    expect(screen.getByRole('main').textContent).toContain('Chat');
});
