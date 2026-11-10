import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { mockViewport } from '@/test/viewport';

import SettingsPanel from './SettingsPanel';

const me = { id: 'u1', name: 'Olena Kovalenko', email: 'olena@example.com', avatar: null, sound: 'classic' };

vi.mock('convex/react', () => ({
    useQuery: () => me,
    useMutation: () => vi.fn(),
    useAction: () => vi.fn()
}));

vi.mock('@convex-dev/auth/react', () => ({ useAuthActions: () => ({ signOut: vi.fn() }) }));

// Артборд Settings: профіль (фото 104, ім'я, пошта), поле Name, розділи з заголовками кольору акценту
test('the settings panel has the profile and the four sections of the canvas', () => {
    mockViewport(true);
    renderWithProviders(<SettingsPanel onBack={ vi.fn() } />);

    const panel = screen.getByRole('region', { name: 'Settings' });

    expect(panel).toBeTruthy();
    expect(screen.getByText('olena@example.com')).toBeTruthy();
    expect(screen.getByLabelText('Name')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Profile' })).toBeTruthy();

    const headings = screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent);

    expect(headings).toEqual([ 'Notifications and sounds', 'Appearance', 'Account' ]);
});

test('on the desktop the arrow goes back to chats', async () => {
    mockViewport(true);

    const onBack = vi.fn();

    renderWithProviders(<SettingsPanel onBack={ onBack } />);

    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Back to chats' }));

    expect(onBack).toHaveBeenCalled();
});

// Артборд MobileSettings: заголовок екрана 32, назад ведуть нижні вкладки
test('on the phone the panel is a screen with a Settings heading and no arrow', () => {
    renderWithProviders(<SettingsPanel onBack={ vi.fn() } />);

    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Back to chats' })).toBeNull();
});
