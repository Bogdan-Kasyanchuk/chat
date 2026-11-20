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

// Артборд Settings → Notifications and sounds: заголовок розділу — підпис групи, «None» без кнопки програвання
test('the sound list is the Notifications and sounds group, None has no Play button', () => {
    renderWithProviders(<SoundSettings sound="classic" />);

    expect(screen.getByRole('heading', { name: 'Notifications and sounds' })).toBeTruthy();
    expect(screen.getByRole('radiogroup', { name: 'Notifications and sounds' })).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Play Classic' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Play None' })).toBeNull();
});
