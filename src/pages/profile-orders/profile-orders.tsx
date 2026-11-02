import { Preloader } from '@ui';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import { selectHistory } from '@services/selectors';
import { useDispatch, useSelector } from '@services/store';
import { startOrdersUpdates } from '@services/thunks/orders';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector(selectHistory);
  useEffect(() => dispatch(startOrdersUpdates('history')), [dispatch]);
  if (isLoading && !orders.length) return <Preloader />;
  const sortedOrders = [...orders].sort((a, b) => b.number - a.number);
  return (
    <>
      {error && <p role="alert">{error}</p>}
      <ProfileOrdersUI orders={sortedOrders} />
    </>
  );
};
