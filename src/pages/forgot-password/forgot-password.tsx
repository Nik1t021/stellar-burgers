import { ForgotPasswordUI } from '@ui-pages';
import { UserState, useEffect, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { selectPassword } from '@/services/selectors';
import {
  requestPasswordReset,
  clearPasswordError,
} from '@services/slices/passwordSlice';
import { useDispatch, useSelector } from '@/services/store';

export const ForgotPassword = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { error, isLoading } = useSelector(selectPassword);
  useEffect(() => {
    dispatch(clearPasswordError());
  }, [dispatch]);

  const navigate = useNavigate();

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    is (isLoading) return;
    void dispatch(requestPasswordReset(email))
      .unwrap()
      .then(() => {
        void navigate('/reset-password', { replace: true });
      })
      .catch(() => {
        /* Ошибка запроса отображается из Redux. */
      });
  };

  return (
    <ForgotPasswordUI
      errorText={error ?? undefined}
      isLoading={isLoading}
      email={email}
      setEmail={setEmail}
      handleSubmit={handleSubmit}
    />
  );
};
