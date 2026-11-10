import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { renderWithProviders } from '@/test/render';

import SettingsSection from './SettingsSection';

// Артборд Settings: розділ — регіон, підписаний своїм заголовком h3 кольору акценту
test('a settings section is a region named by its h3 heading', () => {
    renderWithProviders(
        <SettingsSection
            title="Appearance"
            titleId="appearance-title"
        >
            <p>content</p>
        </SettingsSection>
    );

    const heading = screen.getByRole('heading', { level: 3, name: 'Appearance' });

    expect(heading.id).toBe('appearance-title');
    expect(screen.getByRole('region', { name: 'Appearance' }).contains(heading)).toBe(true);
    expect(screen.getByText('content')).toBeTruthy();
});
