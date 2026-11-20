import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';

import { renderWithProviders } from '@/test/render';

import PasswordField from './PasswordField';

// Кнопка з оком — перемикач: незмінний підпис і aria-pressed (змінний підпис разом з aria-pressed читач екрана
// озвучує як «Hide password, pressed» — стан двічі)
test('the eye button is a toggle that shows and hides the password', async () => {
    const user = userEvent.setup();

    renderWithProviders(<PasswordField label="Password" />);

    const field = screen.getByLabelText('Password');
    const toggle = screen.getByRole('button', { name: 'Show password' });

    expect(field.getAttribute('type')).toBe('password');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');

    await user.click(toggle);

    expect(field.getAttribute('type')).toBe('text');
    expect(screen.getByRole('button', { name: 'Show password' }).getAttribute('aria-pressed')).toBe('true');

    await user.click(toggle);

    expect(field.getAttribute('type')).toBe('password');
});

test('the eye button is reachable with the keyboard', async () => {
    const user = userEvent.setup();

    renderWithProviders(<PasswordField label="Password" />);

    await user.tab();
    await user.tab();

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Show password' }));
});

test.each([ 'Enter', ' ' ])('the key %j toggles the password once', async key => {
    const user = userEvent.setup();

    renderWithProviders(<PasswordField label="Password" />);

    screen.getByRole('button', { name: 'Show password' }).focus();
    await user.keyboard(key === ' ' ? '[Space]' : `{${ key }}`);

    expect(screen.getByLabelText('Password').getAttribute('type')).toBe('text');
});

// NVDA / JAWS у режимі огляду натискають кнопку подією click без mousedown (detail = 0); Mantine її не слухає
test('a click from assistive technology toggles the password', () => {
    renderWithProviders(<PasswordField label="Password" />);

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }), { detail: 0 });

    expect(screen.getByLabelText('Password').getAttribute('type')).toBe('text');
});

// Класи того, хто викликає, не губляться (власний клас кнопки 44×44 додається поруч; у jsdom CSS modules порожні)
test('classNames from the caller reach the field and the eye button', () => {
    renderWithProviders(
        <PasswordField
            label="Password"
            classNames={ { input: 'caller-input', visibilityToggle: 'caller-toggle' } }
        />
    );

    expect(screen.getByRole('button', { name: 'Show password' }).className).toContain('caller-toggle');
    expect(document.querySelector('.caller-input')).not.toBeNull();
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
