import { UnstyledButton } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import type { FC } from 'react';

import { badgeText } from '@/lib/unread';

import classes from './ScrollDownButton.module.css';

type ScrollDownButtonProps = {
    visible: boolean,
    unread: number,
    onClick: () => void
};

// Артборд ScrollDown: кругла кнопка 50 над композером, бейдж непрочитаних у правому верхньому куті
const ScrollDownButton: FC<ScrollDownButtonProps> = ({ visible, unread, onClick }) => {
    if (!visible) {
        return null;
    }

    return (
        <UnstyledButton
            className={ classes.button }
            aria-label={ unread > 0 ? `Scroll to the newest message, ${ unread } unread` : 'Scroll to the newest message' }
            onClick={ onClick }
        >
            <IconChevronDown
                size={ 22 }
                aria-hidden
            />
            { unread > 0 && (
                <span
                    className={ classes.badge }
                    aria-hidden
                >
                    { badgeText(unread) }
                </span>
            ) }
        </UnstyledButton>
    );
};

export default ScrollDownButton;
