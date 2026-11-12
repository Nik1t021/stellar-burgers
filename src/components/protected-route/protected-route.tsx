import { Preloader } from '@ui';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { selectUser } from '@services/selectors';
import { useSelector } from '@services/store';

import type { Location } from 'react-router-dom';

type ProtectedRouteProps = { onlyUnAuth?: boolean };
type AuthLocationState = { from?: Location };
export const ProtectedRoute = ({
  onlyUnAuth = false,
}: ProtectedRouteProps): React.JSX.Element => {
  const { user, isAuthChecked } = useSelector(selectUser);
  const location = useLocation();
  if (!isAuthChecked) return <Preloader />;
  if (!onlyUnAuth && !user)
    return <Navigate to="/login" replace state={{ from: location }} />;
  if (onlyUnAuth && user) {
    const from = (location.state as AuthLocationState | null)?.from;
    return <Navigate to={from ?? '/'} replace />;
  }
  return <Outlet />;
};
