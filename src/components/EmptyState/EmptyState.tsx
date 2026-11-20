import { Text, Title } from '@mantine/core';
import type { FC, ReactNode } from 'react';

import classes from './EmptyState.module.css';

type EmptyStateProps = {
    icon: ReactNode,
    title: string,
    text?: ReactNode,
    action?: ReactNode,
    // Рівень заголовка: h3 у панелі, h1 — коли порожній стан і є сторінкою (404); вигляд завжди 20 / 700
    headingOrder?: 1 | 2 | 3
};

// Порожній стан з канвасу (Components → «404 · empty state style», ChatsEmpty, SearchEmpty):
// іконка в колі 80, заголовок 20 / 700, текст 14 muted, під ними pill-кнопка 44
const EmptyState: FC<EmptyStateProps> = ({ icon, title, text, action, headingOrder = 3 }) => (
    <div className={ classes.root }>
        <span className={ classes.icon }>{ icon }</span>
        <div className={ classes.copy }>
            <Title
                order={ headingOrder }
                size="h3"
            >
                { title }
            </Title>
            { text !== undefined && (
                // Довге слово (пошта в пошуку) переноситься, а не розпирає панель; ширина 260, як на канвасі
                <Text
                    size="sm"
                    c="dimmed"
                    maw={ 260 }
                    mx="auto"
                    style={ { overflowWrap: 'anywhere' } }
                >
                    { text }
                </Text>
            ) }
        </div>
        { action }
    </div>
);

export default EmptyState;
