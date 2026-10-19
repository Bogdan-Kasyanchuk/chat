import { Title } from '@mantine/core';
import { expect, test } from 'vitest';

import { renderWithProviders } from './render';

test('renderWithProviders renders Mantine components', () => {
    const { getByRole } = renderWithProviders(<Title>Hello</Title>);

    expect(getByRole('heading').textContent).toBe('Hello');
});
