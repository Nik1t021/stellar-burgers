import { ProfileMenuUI } from '@ui';
import { useLocation } from 'react-router-dom';

import { selectUser } from '@services/selectors';
import { logoutUser } from '@services/slices/userSlice';
import { useDispatch, useSelector } from '@services/store';

export const ProfileMenu = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { error, isLoading } = useSelector(selectUser);
  const { pathname } = useLocation();

  const handleLogout = (): void => {
    if (!isLoading) void dispatch(logoutUser());
  };

  return (
    <>
      <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />
      {error && (
        <p role="alert" className="text text_type_main-default">
          {error}
        </p>
      )}
    </>
  );
};
