import { useAuthActions } from '@convex-dev/auth/react';
import { LoadingOverlay } from '@mantine/core';
import { ConvexError } from 'convex/values';
import { Component, type FC, type ReactNode, useEffect } from 'react';

import { NOT_SIGNED_IN } from '@convex/chatRules';

type SessionErrorBoundaryProps = {
    children: ReactNode
};

type SessionErrorBoundaryState = {
    error: unknown,
    lost: boolean
};

const isSessionLost = (error: unknown): boolean => error instanceof ConvexError && error.data === NOT_SIGNED_IN;

// Сесії вже немає на сервері: закриваємо її й у браузері, далі PrivateRoute сам веде на /login
const SignOut: FC = () => {
    const { signOut } = useAuthActions();

    useEffect(() => {
        signOut().catch(() => {});
    }, [ signOut ]);

    return (
        <LoadingOverlay
            zIndex={ 1000 }
            visible
        />
    );
};

// Акаунт видалено (тут чи в іншій вкладці): живі запити кидають NOT_SIGNED_IN ще до виходу.
// Без цього вся сторінка падала б у білий екран. Інші помилки летять далі, як і раніше
class SessionErrorBoundary extends Component<SessionErrorBoundaryProps, SessionErrorBoundaryState> {
    state: SessionErrorBoundaryState = { error: null, lost: false };

    static getDerivedStateFromError(error: unknown): SessionErrorBoundaryState {
        return { error, lost: isSessionLost(error) };
    }

    render() {
        const { error, lost } = this.state;

        if (lost) {
            return <SignOut />;
        }

        if (error !== null) {
            throw error;
        }

        return this.props.children;
    }
}

export default SessionErrorBoundary;
