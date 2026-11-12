import { registerUser, clearUserError } from '@/services/slices/userSlice';
import { useDispatch, useSelector } from '@/services/store';
import { RegisterUI } from '@ui-pages';
import { useEffect } from 'react';
import { type SyntheticEvent, useState } from 'react';

import { selectUser } from '@services/selectors';

export const Register = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { error, isLoading } = useSelector(selectUser);
  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    if (isLoading) return;
    void dispatch(registerUser({ name: userName, email, password }));
  };

  return (
    <RegisterUI
      errorText={error ?? undefined}
      isLoading={isLoading}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
