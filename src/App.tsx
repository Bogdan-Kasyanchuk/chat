import { LoadingOverlay } from '@mantine/core';
import { useConvexAuth } from 'convex/react';
import type { FC } from 'react';
import { Outlet, Route, Routes } from 'react-router';

import usePresenceHeartbeat from '@/hooks/usePresenceHeartbeat';
import NotFoundPage from '@/pages/NotFoundPage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import PrivateRoute from '@/routes/PrivateRoute';
import PublicRoute from '@/routes/PublicRoute';

// Заглушка: задача 10 замінює її на ChatLayout, але лишає usePresenceHeartbeat
const ChatLayout: FC = () => {
    usePresenceHeartbeat();

    return <Outlet />;
};

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
