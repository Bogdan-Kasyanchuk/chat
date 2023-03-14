// import { FC } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';

// import useUser from 'hooks/useUser';

// import { IRouteProps } from 'interfaces';

// const PrivateRoute: FC<Pick<IRouteProps, 'children'>> = ({ children }) => {
//   const { user } = useUser();
//   const { state } = useLocation();

//   return user ? children : <Navigate to='/login' state={state} />;
// };

// export default PrivateRoute;
