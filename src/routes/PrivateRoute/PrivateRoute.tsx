import { FC } from 'react';
import { Navigate } from 'react-router-dom';

import useUser from '@/hooks/useUser';

import { IRouteProps } from '@/interfaces';

const PrivateRoute: FC<IRouteProps> = ({ children }) => {
  // const { user } = useUser();
  const user = true;

  return user ? children : <Navigate to='/login' />;
};

export default PrivateRoute;
