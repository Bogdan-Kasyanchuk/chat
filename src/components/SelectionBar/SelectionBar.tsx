import { ActionIcon, Button, Text } from '@mantine/core';
import { IconArrowForwardUp, IconCopy, IconTrash, IconX } from '@tabler/icons-react';
import type { FC, ReactNode } from 'react';

import useIsDesktop from '@/hooks/useIsDesktop';

import classes from './SelectionBar.module.css';

type SelectionBarProps = {
    count: number,
    onForward: () => void,
    onCopy: () => void,
    onDelete: () => void,
    onCancel: () => void
};

type BarAction = {
    label: string,
    icon: ReactNode,
    color: string,
    onClick: () => void
};

// Шапка розмови в режимі вибору повідомлень. На телефоні дії — лише іконки, щоб усе влізло в рядок
const SelectionBar: FC<SelectionBarProps> = ({ count, onForward, onCopy, onDelete, onCancel }) => {
    const isDesktop = useIsDesktop();
    const actions: BarAction[] = [
        { label: 'Forward', icon: <IconArrowForwardUp size={ 18 } />, color: 'gray', onClick: onForward },
        { label: 'Copy', icon: <IconCopy size={ 18 } />, color: 'gray', onClick: onCopy },
        { label: 'Delete', icon: <IconTrash size={ 18 } />, color: 'red', onClick: onDelete }
    ];

    return (
        <header className={ classes.bar }>
            <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                aria-label="Cancel"
                onClick={ onCancel }
            >
                <IconX size={ 20 } />
            </ActionIcon>
            <Text
                className={ classes.count }
                fw={ 600 }
            >
                { count } selected
            </Text>
            { actions.map(action => (isDesktop
                ? (
                    <Button
                        key={ action.label }
                        variant="subtle"
                        color={ action.color }
                        leftSection={ action.icon }
                        onClick={ action.onClick }
                    >
                        { action.label }
                    </Button>
                )
                : (
                    <ActionIcon
                        key={ action.label }
                        variant="subtle"
                        color={ action.color }
                        size="lg"
                        aria-label={ action.label }
                        onClick={ action.onClick }
                    >
                        { action.icon }
                    </ActionIcon>
                ))) }
        </header>
    );
};

export default SelectionBar;
