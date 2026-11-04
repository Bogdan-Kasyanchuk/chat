import { Avatar, Indicator } from '@mantine/core';
import type { FC } from 'react';

import initials from '@/lib/initials';

type PresenceAvatarProps = {
    name: string,
    avatar: string | null,
    online?: boolean,
    size: number
};

const PresenceAvatar: FC<PresenceAvatarProps> = ({ name, avatar, online = false, size }) => (
    <Indicator
        color="green"
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
            color="dark"
        >
            { initials(name) }
        </Avatar>
    </Indicator>
);

export default PresenceAvatar;
