import { screen, within } from '@testing-library/react';
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

// Рішення «Розміри»: на екранах входу й реєстрації поля й кнопки 50px — і кнопка Google теж (Main, MobileSignIn)
test('the Google button is 50px like the fields and the submit button', () => {
    renderCard();

    expect(screen.getByRole('button', { name: 'Continue with Google' }).style.getPropertyValue('--button-height'))
        .toBe('var(--button-height-lg)');
});

// Вітрина — поза формою (main), знак — у колонці форми над заголовком. Що з них видно на якій ширині,
// вирішує CSS — це перевіряє e2e/theme.spec.ts
test('the showcase is outside the form column and the logo is inside it, above the heading', () => {
    renderCard();

    const main = screen.getByRole('main');
    const logo = within(main).getByText('Chat');
    const heading = within(main).getByRole('heading', { level: 1 });

    expect(main.contains(screen.getByText('Messages that arrive the moment they are sent.'))).toBe(false);
    expect(logo.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
