import type { FC } from 'react';
import { Navigate } from 'react-router-dom';

import { useUser } from '@/hooks';

import type { IRouteProps } from '@/interfaces';

const PublicRoute: FC<IRouteProps> = ({ children }) => {
  const { user } = useUser();

  return user ? <Navigate to='/chat' /> : children;
};

export default PublicRoute;
