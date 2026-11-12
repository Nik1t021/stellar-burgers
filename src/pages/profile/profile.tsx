import { ProfileUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

import { selectUser } from '@services/selectors';
import { updateUser, clearUserError } from '@services/slices/userSlice';
import { useDispatch, useSelector } from '@services/store';

export const Profile = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { user, error, isLoading } = useSelector(selectUser);

  const [formValue, setFormValue] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
  });

  useEffect(() => {
    setFormValue((prevState) => ({
      ...prevState,
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
    }));
  }, [user]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    if (isLoading || !isFormChanged || !user) return;
    const changes: Partial<typeof formValue> = {};
    if (formValue.name !== user.name) changes.name = formValue.name;
    if (formValue.email !== user.email) changes.email = formValue.email;
    if (formValue.password) changes.password = formValue.password;
    void dispatch(updateUser(changes));
  };

  const handleCancel = (e: SyntheticEvent): void => {
    e.preventDefault();
    dispatch(clearUserError());
    setFormValue({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <ProfileUI
      updateUserError={error ?? undefined}
      isLoading={isLoading}
      formValue={formValue}
      isFormChanged={isFormChanged}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
