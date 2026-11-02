import { LoginUI } from '@ui-pages';
import { useEffect } from 'react';
import { type SyntheticEvent, useState } from 'react';

import { selectUser } from '@services/selectors';
import { loginUser, clearUserError } from '@/services/slices/userSlice';
import { useDispatch, useSelector } from '@/services/store';

export const Login = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { error, isLoading } = useSelector(selectUser);
  useEffect(() => {
  dispatch(clearUserError());
}, [dispatch]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    if (isLoading) return;
    void dispatch(loginUser({ email, password }));
  };

  return (
    <LoginUI
      errorText={error ?? undefined}
      isLoading={isLoading}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
