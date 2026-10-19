import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import EmojiPicker from './EmojiPicker';

vi.mock('frimousse', async () => (await import('@/test/frimousseMock')).frimousseMock);

afterEach(() => {
    localStorage.clear();
});

test('EmojiPicker reports a pick and remembers it under Recently used', async () => {
    const onSelect = vi.fn();

    renderWithProviders(<EmojiPicker onSelect={ onSelect } />);

    expect(screen.queryByText('Recently used')).toBeNull();

    await userEvent.setup().click(screen.getByRole('button', { name: '😀' }));

    expect(onSelect).toHaveBeenCalledWith('😀');
    expect(screen.getByText('Recently used')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('chat-recent-emoji') ?? '[]')).toEqual([ '😀' ]);
});

test('a recent emoji behaves like a picked one', async () => {
    localStorage.setItem('chat-recent-emoji', JSON.stringify([ '🎉', '😀' ]));
    const onSelect = vi.fn();

    renderWithProviders(<EmojiPicker onSelect={ onSelect } />);
    await userEvent.setup().click(screen.getByRole('button', { name: '🎉' }));

    expect(onSelect).toHaveBeenLastCalledWith('🎉');
    expect(JSON.parse(localStorage.getItem('chat-recent-emoji') ?? '[]')).toEqual([ '🎉', '😀' ]);
});
