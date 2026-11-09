import { screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import AuthCard from './AuthCard';

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signIn: vi.fn() })
}));

// Текст розділювача — з канвасу (Main, SignUp, MobileSignIn, MobileSignUp)
test('the divider between Google and the form says or with email', () => {
    renderWithProviders(
        <AuthCard
            title="Sign in"
            googleLabel="Continue with Google"
            footer={ null }
        >
            <p>form</p>
        </AuthCard>
    );

    expect(screen.queryByText('or with email')).not.toBeNull();
});
