import { useMantineColorScheme } from '@mantine/core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';
import { expect, test } from 'vitest';

import { renderWithProviders } from '@/test/render';

import AppearanceSettings from './AppearanceSettings';

const Scheme: FC = () => <output>{ useMantineColorScheme().colorScheme }</output>;

// Settings → Appearance: перемикач теми System / Light / Dark (рішення «Теми»)
test('Appearance switches between System, Light and Dark', async () => {
    const user = userEvent.setup();

    renderWithProviders(
        <>
            <AppearanceSettings />
            <Scheme />
        </>
    );

    expect(screen.getByRole('heading', { name: 'Appearance' })).toBeTruthy();
    expect(screen.getByRole('radiogroup', { name: 'Theme' })).toBeTruthy();

    await user.click(screen.getByLabelText('Dark'));
    expect(screen.getByRole('status').textContent).toBe('dark');

    await user.click(screen.getByLabelText('Light'));
    expect(screen.getByRole('status').textContent).toBe('light');

    await user.click(screen.getByLabelText('System'));
    expect(screen.getByRole('status').textContent).toBe('auto');
});
