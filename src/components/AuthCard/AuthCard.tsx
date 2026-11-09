import { Divider, Text, Title } from '@mantine/core';
import type { FC, ReactNode } from 'react';

import AuthShowcase from '@/components/AuthShowcase';
import GoogleButton from '@/components/GoogleButton';
import Logo from '@/components/Logo';

import classes from './AuthCard.module.css';

type AuthCardProps = {
    title: string,
    subtitle: string,
    googleLabel: string,
    showcase: 'messages' | 'contacts',
    footer: ReactNode,
    children: ReactNode
};

// Екран входу й реєстрації (Main, SignUp, MobileSignIn, MobileSignUp): на десктопі вітрина ліворуч і форма праворуч,
// на телефоні — знак над заголовком і форма на всю ширину
const AuthCard: FC<AuthCardProps> = ({ title, subtitle, googleLabel, showcase, footer, children }) => (
    <div className={ classes.page }>
        <div className={ classes.showcase }>
            <AuthShowcase variant={ showcase } />
        </div>
        <main className={ classes.main }>
            <div className={ classes.column }>
                <div className={ classes.logo }>
                    <Logo />
                </div>
                <div className={ classes.heading }>
                    <Title
                        order={ 1 }
                        className={ classes.title }
                    >
                        { title }
                    </Title>
                    <Text c="dimmed">{ subtitle }</Text>
                </div>
                <GoogleButton label={ googleLabel } />
                <Divider label="or with email" />
                { children }
                { footer }
            </div>
        </main>
    </div>
);

export default AuthCard;
