import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';

import { renderWithProviders } from '@/test/render';

import PasswordField from './PasswordField';

// Кнопка з оком на канвасі — справжня кнопка з підписом і aria-pressed, до неї можна дійти Tab-ом
test('the eye button shows and hides the password and says what it will do', async () => {
    const user = userEvent.setup();

    renderWithProviders(<PasswordField label="Password" />);

    const field = screen.getByLabelText('Password');
    const toggle = screen.getByRole('button', { name: 'Show password' });

    expect(field.getAttribute('type')).toBe('password');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');

    await user.click(toggle);

    expect(field.getAttribute('type')).toBe('text');
    expect(screen.getByRole('button', { name: 'Hide password' }).getAttribute('aria-pressed')).toBe('true');
});

test('the eye button is reachable with the keyboard', async () => {
    const user = userEvent.setup();

    renderWithProviders(<PasswordField label="Password" />);

    await user.tab();
    await user.tab();

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Show password' }));
});

// PasswordInput Mantine не ставить aria-invalid на внутрішній <input>, тож читач екрана не чує, що поле з помилкою
test('a field with an error is marked invalid and described by the error', () => {
    renderWithProviders(
        <PasswordField
            label="Password"
            error="Wrong email or password"
        />
    );

    const field = screen.getByLabelText('Password');
    const describedBy = field.getAttribute('aria-describedby') ?? '';

    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(describedBy.split(' ').map(id => document.getElementById(id)?.textContent)).toContain('Wrong email or password');
});
