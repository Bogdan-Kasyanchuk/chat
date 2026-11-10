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

// Components → presence: крапка 14 з рамкою 2.5 кольору тла (рядок відкритого чату підміняє --presence-ring)
test('the online dot is 14px with a 2.5px ring of the background', () => {
    renderWithProviders(
        <PresenceAvatar
            userId="u1"
            name="Bob"
            avatar={ null }
            size={ 44 }
            online
        />
    );

    const dot = screen.getByTestId('online-dot');

    expect(dot.style.getPropertyValue('--presence-dot')).toBe('14px');
    expect(screen.queryByTestId('online-dot')).toBeTruthy();
});

test('an offline avatar has no dot', () => {
    renderWithProviders(
        <PresenceAvatar
            userId="u1"
            name="Bob"
            avatar={ null }
            size={ 44 }
        />
    );

    expect(screen.queryByTestId('online-dot')).toBeNull();
});
