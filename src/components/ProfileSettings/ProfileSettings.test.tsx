import { notifications } from '@mantine/notifications';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import ProfileSettings from './ProfileSettings';

const updateName = vi.fn();

vi.mock('convex/react', () => ({
    useMutation: () => updateName
}));

afterEach(() => {
    updateName.mockReset();
});

test('ProfileSettings saves a trimmed name', async () => {
    updateName.mockResolvedValue(null);

    renderWithProviders(<ProfileSettings name="Alice" />);

    const user = userEvent.setup();
    const input = screen.getByLabelText('Name');

    await user.clear(input);
    await user.type(input, '  Bob  ');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
        expect(updateName).toHaveBeenCalledWith({ name: 'Bob' });
    });
});

// Toast без власної іконки global.css малює як помилку («!»): успіх приносить свою галочку
test('saving the name shows Profile updated with a success icon', async () => {
    updateName.mockResolvedValue(null);

    const show = vi.spyOn(notifications, 'show');

    renderWithProviders(<ProfileSettings name="Alice" />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Name'), 'x');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
        expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Profile updated', icon: expect.anything() }));
    });
    show.mockRestore();
});

test('ProfileSettings rejects an empty name without saving', async () => {
    renderWithProviders(<ProfileSettings name="Alice" />);

    const user = userEvent.setup();

    await user.clear(screen.getByLabelText('Name'));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Name is required')).toBeTruthy();
    expect(updateName).not.toHaveBeenCalled();
});
