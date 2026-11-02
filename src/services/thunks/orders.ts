import { fetchFeed, fetchHistory } from '../slices/feedSlice';
import type { AppDispatch } from '../store';
export const ORDERS_REFRESH_INTERVAL = 5000;
// Повторяем HTTP-запрос после завершения предыдущего, без пересечений.
export const startOrdersUpdates =
  (source: 'feed' | 'history') =>
  (dispatch: AppDispatch): (() => void) => {
    let isActive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const updateOrders = async (): Promise<void> => {
      if (source === 'feed') await dispatch(fetchFeed());
      else await dispatch(fetchHistory());
      if (isActive)
        timer = setTimeout(() => {
          void updateOrders();
        }, ORDERS_REFRESH_INTERVAL);
    };
    void updateOrders();
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  };