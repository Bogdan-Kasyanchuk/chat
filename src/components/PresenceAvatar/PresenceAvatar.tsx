import { Avatar } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import type { CSSProperties, FC } from 'react';

import avatarColor from '@/lib/avatarColor';
import initials from '@/lib/initials';

import classes from './PresenceAvatar.module.css';

type PresenceAvatarProps = {
    // null — видалений акаунт: нейтральне тло й іконка замість ініціалів
    userId: string | null,
    name: string,
    avatar: string | null,
    online?: boolean,
    size: number
};

// Крапка «онлайн» 14 на аватарі 44 (Components → presence), на інших розмірах — та сама пропорція.
// Рамка — колір тла під аватаром: --presence-ring, за замовчуванням тло бічної панелі
const PresenceAvatar: FC<PresenceAvatarProps> = ({ userId, name, avatar, online = false, size }) => (
    <span
        className={ classes.root }
        style={ { width: size, height: size } }
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
        { online && (
            <span
                className={ classes.dot }
                data-testid="online-dot"
                style={ { '--presence-dot': `${ Math.max(8, Math.round(size * 14 / 44)) }px` } as CSSProperties }
            />
        ) }
    </span>
);

export default PresenceAvatar;
