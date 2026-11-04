import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import SoundSettings from './SoundSettings';

const setSound = vi.fn();
const playSound = vi.fn();

vi.mock('convex/react', () => ({
    useMutation: () => setSound
}));

vi.mock('@/lib/sounds', async importOriginal => ({
    ...await importOriginal<typeof import('@/lib/sounds')>(),
    playSound: (sound: string) => playSound(sound)
}));

afterEach(() => {
    setSound.mockReset();
    playSound.mockReset();
});

test('choosing a sound saves and previews it', async () => {
    setSound.mockResolvedValue(null);

    renderWithProviders(<SoundSettings sound="classic" />);
    await userEvent.setup().click(screen.getByLabelText('Pop'));

    await waitFor(() => {
        expect(setSound).toHaveBeenCalledWith({ sound: 'pop' });
    });
    expect(playSound).toHaveBeenCalledWith('pop');
});

test('the Play button previews without saving', async () => {
    renderWithProviders(<SoundSettings sound="classic" />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Play Chime' }));

    expect(playSound).toHaveBeenCalledWith('chime');
    expect(setSound).not.toHaveBeenCalled();
});
