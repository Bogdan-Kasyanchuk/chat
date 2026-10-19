import { Text } from '@mantine/core';
import type { FC, Ref } from 'react';

import classes from './UnreadDivider.module.css';

type UnreadDividerProps = {
    // Стрічка прокручує до розділювача при відкритті чату
    ref?: Ref<HTMLDivElement>
};

const UnreadDivider: FC<UnreadDividerProps> = ({ ref }) => (
    <div
        ref={ ref }
        className={ classes.divider }
    >
        <Text
            size="sm"
            fw={ 500 }
        >
            Unread messages
        </Text>
    </div>
);

export default UnreadDivider;
