// import { FC } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';

// import useUser from 'hooks/useUser';

// import { IRouteProps } from 'interfaces';

// const PublicRoute: FC<IRouteProps> = ({ children, restricted = false }) => {
//   const { user } = useUser();
//   const { state } = useLocation();

//   const shouldRedirect = user && restricted;

//   if (shouldRedirect && state) return <Navigate to={`/game/${state.id}`} state={state} />;

//   return shouldRedirect ? <Navigate to='/' /> : children;
// };

// export default PublicRoute;
