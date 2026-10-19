import type { FC } from 'react';
import { Navigate } from 'react-router-dom';

import { useUser } from '@/hooks';

import type { IRouteProps } from '@/interfaces';

const PrivateRoute: FC<IRouteProps> = ({ children }) => {
  const { user } = useUser();

  return user ? children : <Navigate to='/' />;
};

export default PrivateRoute;
