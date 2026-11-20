import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { renderWithProviders } from '@/test/render';

import ChatListSkeleton from './ChatListSkeleton';

// Артборд Loading: вісім рядків-заглушок (коло 44 і дві смуги) замість списку
test('the skeleton has eight rows and is announced as loading', () => {
    renderWithProviders(<ChatListSkeleton />);

    const skeleton = screen.getByLabelText('Loading chats');

    expect(skeleton.getAttribute('aria-busy')).toBe('true');
    expect(skeleton.querySelectorAll('[data-row]')).toHaveLength(8);
});
