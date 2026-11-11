import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { mockViewport } from '@/test/viewport';

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

const TABS = [ 'Smileys and people', 'Animals and nature', 'Food and drink', 'Activities', 'Travel and places', 'Objects', 'Flags' ];
const tabNames = () => within(screen.getByRole('navigation', { name: 'Emoji categories' }))
    .getAllByRole('button')
    .map(tab => tab.getAttribute('aria-label'));

// Артборд EmojiPicker: пошук і відтінок шкіри зверху, Recently used, список, вкладки категорій знизу
test('the emoji picker keeps the canvas layout: search, Recently used, category tabs', () => {
    mockViewport(true);
    localStorage.setItem('chat-recent-emoji', JSON.stringify([ '🎉' ]));
    renderWithProviders(<EmojiPicker onSelect={ vi.fn() } />);

    const search = screen.getByRole('textbox', { name: 'Search emoji' });
    const recent = screen.getByText('Recently used');
    const nav = screen.getByRole('navigation', { name: 'Emoji categories' });

    expect(search.compareDocumentPosition(recent) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(recent.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(tabNames()).toEqual([ 'Recently used', ...TABS ]);
    expect(screen.getByRole('button', { name: 'Smileys and people' }).getAttribute('aria-pressed')).toBe('true');
});

// Артборд MobileEmoji: панель 300 — вкладки зверху, без пошуку; без недавніх немає й їхньої вкладки
test('on a phone the category tabs go on top and there is no search', () => {
    mockViewport(false);
    renderWithProviders(<EmojiPicker onSelect={ vi.fn() } />);

    expect(screen.queryByRole('textbox', { name: 'Search emoji' })).toBeNull();
    expect(tabNames()).toEqual(TABS);

    const nav = screen.getByRole('navigation', { name: 'Emoji categories' });

    expect(nav.compareDocumentPosition(screen.getByTestId('emoji-viewport')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test('a category tab scrolls the list to its category and becomes pressed', async () => {
    mockViewport(true);
    renderWithProviders(<EmojiPicker onSelect={ vi.fn() } />);

    const viewport = screen.getByTestId('emoji-viewport');
    const animals = screen.getByText('animals & nature').parentElement as HTMLElement;

    Object.defineProperty(animals, 'offsetTop', { value: 480 });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Animals and nature' }));

    expect(viewport.scrollTop).toBe(480);
    expect(screen.getByRole('button', { name: 'Animals and nature' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Smileys and people' }).getAttribute('aria-pressed')).toBe('false');
});
