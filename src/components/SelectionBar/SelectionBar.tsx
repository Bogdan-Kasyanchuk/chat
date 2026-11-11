import { ActionIcon, Button, Text, UnstyledButton } from '@mantine/core';
import { IconArrowForwardUp, IconCopy, IconTrash, IconX } from '@tabler/icons-react';
import type { FC, ReactNode } from 'react';

import useIsDesktop from '@/hooks/useIsDesktop';

import classes from './SelectionBar.module.css';

type SelectionHandlers = {
    onForward: () => void,
    onCopy: () => void,
    onDelete: () => void
};

type SelectionBarProps = SelectionHandlers & {
    count: number,
    onCancel: () => void
};

type BarAction = {
    label: string,
    icon: ReactNode,
    danger?: boolean,
    onClick: () => void
};

const icon = (Icon: typeof IconCopy, size: number) => (
    <Icon
        size={ size }
        stroke={ 1.9 }
        aria-hidden
    />
);

const barActions = ({ onForward, onCopy, onDelete }: SelectionHandlers, size: number): BarAction[] => [
    { label: 'Forward', icon: icon(IconArrowForwardUp, size), onClick: onForward },
    { label: 'Copy', icon: icon(IconCopy, size), onClick: onCopy },
    { label: 'Delete', icon: icon(IconTrash, size), danger: true, onClick: onDelete }
];

// Шапка розмови в режимі вибору. Артборд Selection: «N selected» і кнопки з підписами (вторинні, Delete —
// danger soft); MobileSelection: лише хрестик і лічильник, дії — у SelectionActions унизу
const SelectionBar: FC<SelectionBarProps> = ({ count, onCancel, ...handlers }) => {
    const isDesktop = useIsDesktop();

    return (
        <header className={ classes.bar }>
            <ActionIcon
                variant="subtle"
                color="gray"
                size={ 44 }
                aria-label="Cancel selection"
                onClick={ onCancel }
            >
                <IconX
                    size={ 22 }
                    stroke={ 2 }
                />
            </ActionIcon>
            <Text
                className={ classes.count }
                fw={ 700 }
            >
                { count } selected
            </Text>
            { isDesktop && barActions(handlers, 18).map(action => (
                <Button
                    key={ action.label }
                    variant={ action.danger ? 'light' : 'default' }
                    color={ action.danger ? 'red' : undefined }
                    leftSection={ action.icon }
                    onClick={ action.onClick }
                >
                    { action.label }
                </Button>
            )) }
        </header>
    );
};

// Нижня панель вибору на телефоні замість композера: три пункти 56, іконка над підписом 14
export const SelectionActions: FC<SelectionHandlers> = handlers => (
    <div
        className={ classes.actions }
        role="toolbar"
        aria-label="Selected messages"
    >
        { barActions(handlers, 22).map(action => (
            <UnstyledButton
                key={ action.label }
                className={ classes.action }
                mod={ { danger: action.danger } }
                onClick={ action.onClick }
            >
                { action.icon }
                { action.label }
            </UnstyledButton>
        )) }
    </div>
);

export default SelectionBar;
