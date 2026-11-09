import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { renderWithProviders } from '@/test/render';

import Logo from './Logo';

// Знак з канвасу (Main, MobileSignIn): квадрат 36 з радіусом 12 і бульбашками, поруч слово «Chat»
test('shows the mark next to the name of the app', () => {
    const { container } = renderWithProviders(<Logo />);

    expect(screen.getByText('Chat')).toBeTruthy();
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
});
