import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { renderWithProviders } from '@/test/render';

import ChatWallpaper from './ChatWallpaper';

// Тло розмови (--chat-bg і крапки --chat-pattern) — головна область сторінки
test('ChatWallpaper is the main landmark around the conversation', () => {
    renderWithProviders(<ChatWallpaper><p>feed</p></ChatWallpaper>);

    expect(screen.getByRole('main').textContent).toBe('feed');
});
