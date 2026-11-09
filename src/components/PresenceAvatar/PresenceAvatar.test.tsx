import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import avatarColor, { AVATAR_NEUTRAL } from '@/lib/avatarColor';
import { renderWithProviders } from '@/test/render';

import PresenceAvatar from './PresenceAvatar';

const avatarBg = (text: string) => (screen.getByText(text).closest('.mantine-Avatar-root') as HTMLElement)
    .style.getPropertyValue('--avatar-bg');

test('PresenceAvatar paints initials with avatarColor of the user', () => {
    renderWithProviders(
        <PresenceAvatar
            userId="k17abc"
            name="Marko Shevchuk"
            avatar={ null }
            size={ 44 }
        />
    );

    expect(avatarBg('MS')).toBe(avatarColor('k17abc'));
});

test('a deleted account gets the neutral colour and an icon instead of initials', () => {
    renderWithProviders(
        <PresenceAvatar
            userId={ null }
            name="Deleted account"
            avatar={ null }
            size={ 44 }
        />
    );

    expect(screen.queryByText('DA')).toBeNull();
    const root = screen.getByTestId('deleted-avatar').closest('.mantine-Avatar-root') as HTMLElement;

    expect(root.style.getPropertyValue('--avatar-bg')).toBe(AVATAR_NEUTRAL);
});
