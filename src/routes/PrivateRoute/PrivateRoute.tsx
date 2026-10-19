import { useConvexAuth } from 'convex/react';
import type { FC, ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router';

const PrivateRoute: FC<{ children: ReactElement }> = ({ children }) => {
    const { isAuthenticated } = useConvexAuth();
    const location = useLocation();

    if (isAuthenticated) {
        return children;
    }

    return (
        <Navigate
            to="/login"
            state={ { from: location.pathname + location.search } }
            replace
        />
    );
};

export default PrivateRoute;
