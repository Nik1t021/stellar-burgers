import { getFeedsApi } from '@api';
import { configureStore } from '@reduxjs/toolkit';

import { rootReducer } from '../rootReducer';
import { ORDERS_REFRESH_INTERVAL, startOrdersUpdates } from './orders';

jest.mock('@api');
beforeEach(() => {
  jest.resetAllMocks();
  jest.useFakeTimers();
});
afterEach(() => jest.useRealTimers());

test('лента автоматически обновляется и прекращает запросы после ухода со страницы', async () => {
  jest
    .mocked(getFeedsApi)
    .mockResolvedValue({ success: true, orders: [], total: 1, totalToday: 1 });
  const store = configureStore({ reducer: rootReducer });
  const stop = store.dispatch(startOrdersUpdates('feed'));
  await jest.advanceTimersByTimeAsync(0);
  expect(store.getState().orders.feed.total).toBe(1);
  jest
    .mocked(getFeedsApi)
    .mockResolvedValue({ success: true, orders: [], total: 2, totalToday: 2 });
  await jest.advanceTimersByTimeAsync(ORDERS_REFRESH_INTERVAL);
  expect(store.getState().orders.feed.total).toBe(2);
  expect(getFeedsApi).toHaveBeenCalledTimes(2);
  stop();
  await jest.advanceTimersByTimeAsync(ORDERS_REFRESH_INTERVAL * 2);
  expect(getFeedsApi).toHaveBeenCalledTimes(2);
});

test('медленный запрос не запускается повторно до завершения', async () => {
  let complete!: (data: Awaited<ReturnType<typeof getFeedsApi>>) => void;
  jest.mocked(getFeedsApi).mockImplementation(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      })
  );
  const store = configureStore({ reducer: rootReducer });
  const stop = store.dispatch(startOrdersUpdates('feed'));
  await jest.advanceTimersByTimeAsync(ORDERS_REFRESH_INTERVAL * 3);
  expect(getFeedsApi).toHaveBeenCalledTimes(1);
  stop();
  complete({ success: true, orders: [], total: 1, totalToday: 1 });
  await jest.advanceTimersByTimeAsync(ORDERS_REFRESH_INTERVAL * 2);
  expect(getFeedsApi).toHaveBeenCalledTimes(1);
});