import { Avatar, Indicator } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import type { FC } from 'react';

import avatarColor from '@/lib/avatarColor';
import initials from '@/lib/initials';

type PresenceAvatarProps = {
    // null — видалений акаунт: нейтральне тло й іконка замість ініціалів
    userId: string | null,
    name: string,
    avatar: string | null,
    online?: boolean,
    size: number
};

// Крапка «онлайн» обведена кольором тла (withBorder бере --mantine-color-body)
const PresenceAvatar: FC<PresenceAvatarProps> = ({ userId, name, avatar, online = false, size }) => (
    <Indicator
        color="var(--chat-online)"
        size={ Math.max(8, Math.round(size / 4)) }
        offset={ Math.round(size / 8) }
        position="bottom-end"
        disabled={ !online }
        withBorder
    >
        <Avatar
            src={ avatar }
            alt={ name }
            size={ size }
            color={ avatarColor(userId) }
            variant="filled"
        >
            { userId === null
                ? (
                    <IconUser
                        data-testid="deleted-avatar"
                        size={ Math.round(size * 0.55) }
                        stroke={ 1.8 }
                    />
                )
                : initials(name) }
        </Avatar>
    </Indicator>
);

export default PresenceAvatar;
