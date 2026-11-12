import { selectUser } from '@/services/selectors';
import { useSelector } from '@/services/store';
import { AppHeaderUI } from '@ui';

export const AppHeader = (): React.JSX.Element => {
  const { user } = useSelector(selectUser);
  return <AppHeaderUI userName={user?.name} />;
};
