import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { renderWithProviders } from '@/test/render';

import EmptyChat from './EmptyChat';

// Артборд ChatsEmpty, права частина: плашка на тлі розмови
test('without an open chat the conversation area says Select a chat to start messaging', () => {
    renderWithProviders(<EmptyChat />);

    expect(screen.getByText('Select a chat to start messaging')).toBeTruthy();
});
