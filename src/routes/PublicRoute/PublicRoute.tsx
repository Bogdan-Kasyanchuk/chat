import { useConvexAuth } from 'convex/react';
import type { FC, ReactElement } from 'react';
import { Navigate } from 'react-router';

import useFrom from '@/hooks/useFrom';

type PublicRouteProps = {
    children: ReactElement,
    restricted?: boolean
};

const PublicRoute: FC<PublicRouteProps> = ({ children, restricted = false }) => {
    const { isAuthenticated } = useConvexAuth();
    const from = useFrom();

    if (isAuthenticated && restricted) {
        return (
            <Navigate
                to={ from }
                replace
            />
        );
    }

    return children;
};

export default PublicRoute;
