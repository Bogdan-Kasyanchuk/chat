import { ActionIcon, Badge } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import type { FC } from 'react';

import classes from './ScrollDownButton.module.css';

type ScrollDownButtonProps = {
    visible: boolean,
    unread: number,
    onClick: () => void
};

const MAX_BADGE = 99;

const ScrollDownButton: FC<ScrollDownButtonProps> = ({ visible, unread, onClick }) => {
    if (!visible) {
        return null;
    }

    return (
        <div className={ classes.wrapper }>
            <ActionIcon
                className={ classes.button }
                variant="default"
                size={ 44 }
                aria-label="Scroll to the latest messages"
                onClick={ onClick }
            >
                <IconChevronDown size={ 22 } />
            </ActionIcon>
            { unread > 0 && (
                <Badge
                    className={ classes.badge }
                    circle={ unread < 10 }
                    color="dark"
                    size="sm"
                >
                    { unread > MAX_BADGE ? `${ MAX_BADGE }+` : unread }
                </Badge>
            ) }
        </div>
    );
};

export default ScrollDownButton;
