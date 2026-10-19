import { LoadingOverlay } from '@mantine/core';
import { useConvexAuth } from 'convex/react';
import type { FC } from 'react';
import { Route, Routes } from 'react-router';

import ChatLayout from '@/components/ChatLayout';
import NotFoundPage from '@/pages/NotFoundPage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import PrivateRoute from '@/routes/PrivateRoute';
import PublicRoute from '@/routes/PublicRoute';

const App: FC = () => {
    const { isLoading } = useConvexAuth();

    if (isLoading) {
        return (
            <LoadingOverlay
                zIndex={ 1000 }
                visible
            />
        );
    }

    return (
        <Routes>
            <Route
                path="/login"
                element={ <PublicRoute restricted><SignInPage /></PublicRoute> }
            />
            <Route
                path="/signup"
                element={ <PublicRoute restricted><SignUpPage /></PublicRoute> }
            />
            <Route element={ <PrivateRoute><ChatLayout /></PrivateRoute> }>
                <Route
                    path="/"
                    element={ <p>Chat</p> }
                />
                <Route
                    path="/chat/:chatId"
                    element={ <p>Chat</p> }
                />
            </Route>
            <Route
                path="*"
                element={ <NotFoundPage /> }
            />
        </Routes>
    );
};

export default App;
