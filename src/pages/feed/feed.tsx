import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

import { selectFeed } from '@services/selectors';
import { fetchFeed } from '@services/slices/feedSlice';
import { useDispatch, useSelector } from '@services/store';
import { startOrdersUpdates } from '@services/thunks/orders';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector(selectFeed);
  useEffect(() => dispatch(startOrdersUpdates('feed')), [dispatch]);
  const handleGetFeeds = (): void => {
    if (!isLoading) void dispatch(fetchFeed());
  };
  if (isLoading && !orders.length) return <Preloader />;
  return (
    <>
      {Boolean(error) && <p role="alert">Не удалось загрузить ленту заказов</p>}
      <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />
    </>
  );
};
