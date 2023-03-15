import { FC } from 'react';
import { Navigate } from 'react-router-dom';

import useUser from '@/hooks/useUser';

import { IRouteProps } from '@/interfaces';

const PublicRoute: FC<IRouteProps> = ({ children }) => {
  // const { user } = useUser();

  const user = false;

  return user ? <Navigate to='/' /> : children;
};

export default PublicRoute;
