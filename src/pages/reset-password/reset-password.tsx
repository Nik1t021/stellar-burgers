import { ResetPasswordUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { selectPassword } from '@/services/selectors';
import { resetPassword, clearPasswordError } from '@/services/slices/passwordSlice';
import { useDispatch, useSelector } from '@/services/store';

export const ResetPassword = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const dispatch = useDispatch();
  const { error, isLoading } = useSelector(selectPassword);
  useEffect(() => {
    dispatch(clearPasswordError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    if (isLoading) return;
    void dispatch(resetPassword({ password, token }))
      .unwrap()
      .then(() => {
        void navigate('/login', {replace: true });
      })
      .catch(() => {
        /* Ошибка запроса отображается из Redux. */
      });
  };

  useEffect(() => {
    if (!localStorage.getItem('resetPassword')) {
      void navigate('/forgot-password', { replace: true });
    }
  }, [navigate]);

  return (
    <ResetPasswordUI
      errorText={error ?? uderfined}
      isLoading={isLoading}
      password={password}
      token={token}
      setPassword={setPassword}
      setToken={setToken}
      handleSubmit={handleSubmit}
    />
  );
};
