import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { renderWithProviders } from '@/test/render';

import AuthShowcase from './AuthShowcase';

// Вітрина ліворуч від форми: на вході — листування (Main), на реєстрації — контакти (SignUp)
test('the sign-in showcase is a conversation under its headline', () => {
    renderWithProviders(<AuthShowcase variant="messages" />);

    expect(screen.getByText('Messages that arrive the moment they are sent.')).toBeTruthy();
    expect(screen.getByText('See who is online, reply, forward and keep your contacts in one place.')).toBeTruthy();
    expect(screen.getByText('Are we still on for tonight?')).toBeTruthy();
    expect(screen.getByText('Forwarded from Iryna Bondar')).toBeTruthy();
});

test('the sign-up showcase is a list of contacts under its headline', () => {
    renderWithProviders(<AuthShowcase variant="contacts" />);

    expect(screen.getByText('Add people by email and start talking.')).toBeTruthy();
    expect(screen.getByText('Only your contacts and the people you write to can see you.')).toBeTruthy();
    expect(screen.getByText('Marko Shevchuk')).toBeTruthy();
    expect(screen.getByText('last seen yesterday at 22:14')).toBeTruthy();
});

// Це картинка, а не зміст: читач екрана її пропускає, і на ній немає нічого, на що можна натиснути
test('the showcase is decoration hidden from assistive technology', () => {
    const { container } = renderWithProviders(<AuthShowcase variant="messages" />);

    expect(container.querySelector('section')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelectorAll('a, button, input')).toHaveLength(0);
});
