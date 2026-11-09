import { Button } from '@mantine/core';
import { IconCompass } from '@tabler/icons-react';
import type { FC } from 'react';
import { Link } from 'react-router';

import EmptyState from '@/components/EmptyState';

import classes from './NotFoundPage.module.css';

// Блок «404 · empty state style» на аркуші Components: той самий вигляд, що й порожні стани, посередині сторінки
const NotFoundPage: FC = () => (
    <main className={ classes.page }>
        <EmptyState
            icon={
                <IconCompass
                    size={ 36 }
                    stroke={ 1.8 }
                    aria-hidden
                />
            }
            title="Page not found"
            text="The link is broken or the page was removed."
            action={
                <Button
                    component={ Link }
                    to="/"
                    radius="xl"
                    fz="md"
                >
                    Back to chats
                </Button>
            }
        />
    </main>
);

export default NotFoundPage;
