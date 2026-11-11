import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { renderWithProviders } from '@/test/render';

import MessagesSkeleton from './MessagesSkeleton';

// Components → Conversation states → Loading: бульбашки-заглушки з обох боків стрічки
test('the feed skeleton has six bubbles on both sides and is announced as loading', () => {
    renderWithProviders(<MessagesSkeleton />);

    const skeleton = screen.getByLabelText('Loading messages');
    const bubbles = [ ...skeleton.querySelectorAll('[data-bubble]') ];

    expect(skeleton.getAttribute('aria-busy')).toBe('true');
    expect(bubbles).toHaveLength(6);
    expect(new Set(bubbles.map(bubble => bubble.getAttribute('data-side')))).toEqual(new Set([ 'in', 'out' ]));
    expect(skeleton.querySelector('[data-header]')).toBeNull();
});

// Артборд Loading: поки чат не відповів — ще шапка й композер блоками
test('the full skeleton adds the header and the composer', () => {
    renderWithProviders(<MessagesSkeleton full />);

    const skeleton = screen.getByLabelText('Loading chat');

    expect(skeleton.querySelector('[data-header]')).toBeTruthy();
    expect(skeleton.querySelector('[data-composer]')).toBeTruthy();
    expect(skeleton.querySelectorAll('[data-bubble]')).toHaveLength(6);
});
