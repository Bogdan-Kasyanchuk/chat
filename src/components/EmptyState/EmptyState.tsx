import { Text, Title } from '@mantine/core';
import type { FC, ReactNode } from 'react';

import classes from './EmptyState.module.css';

type EmptyStateProps = {
    icon: ReactNode,
    title: string,
    text?: ReactNode,
    action?: ReactNode
};

// Порожній стан з канвасу (Components → «404 · empty state style», ChatsEmpty, SearchEmpty):
// іконка в колі 80, заголовок 20 / 700, текст 14 muted, під ними pill-кнопка 44
const EmptyState: FC<EmptyStateProps> = ({ icon, title, text, action }) => (
    <div className={ classes.root }>
        <span className={ classes.icon }>{ icon }</span>
        <div className={ classes.copy }>
            <Title order={ 3 }>{ title }</Title>
            { text !== undefined && (
                <Text
                    size="sm"
                    c="dimmed"
                >
                    { text }
                </Text>
            ) }
        </div>
        { action }
    </div>
);

export default EmptyState;
