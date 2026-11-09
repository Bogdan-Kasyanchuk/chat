import { Divider, Paper, Stack, Title } from '@mantine/core';
import type { FC, ReactNode } from 'react';

import GoogleButton from '@/components/GoogleButton';

import classes from './AuthCard.module.css';

type AuthCardProps = {
    title: string,
    googleLabel: string,
    footer: ReactNode,
    children: ReactNode
};

const AuthCard: FC<AuthCardProps> = ({ title, googleLabel, footer, children }) => (
    <div className={ classes.wrapper }>
        <Paper
            className={ classes.card }
            p="xl"
            withBorder
        >
            <Stack gap="md">
                <Title
                    order={ 2 }
                    ta="center"
                >
                    { title }
                </Title>
                <GoogleButton label={ googleLabel } />
                <Divider label="or" />
                { children }
                { footer }
            </Stack>
        </Paper>
    </div>
);

export default AuthCard;
