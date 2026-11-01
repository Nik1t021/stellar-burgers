import { getFeedsApi, getOrdersApi, getOrderByNumberApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { logoutUser } from './userSlice';
import type { TFeedState, TOrder } from '@utils-types';
const initialFeed: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null,
};
const initialState = {
  feed: initialFeed,
  history: {
    orders: [] as TOrder[],
    isLoading: false,
    error: null as string | null,
    requestId: '',
  },
  detail: {
    order: null as TOrder | null,
    isLoading: false,
    error: null as string | null,
    requestId: '',
  },
};
export const fetchFeed = createAsyncThunk('orders/feed', getFeedsApi);
export const fetchHistory = createAsyncThunk('orders/history', getOrdersApi, {
  condition: (_, { getState }) =>
    Boolean((getState() as { user: { user: unknown } }).user.user),
});
export const fetchOrder = createAsyncThunk('orders/detail', async (number: number) => {
  const data = await getOrderByNumberApi(number);
  if (!data.success || !data.orders.length) throw new Error('Заказ не найден');
  return data.orders[0];
});
const feedSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.feed.isLoading = true;
        state.feed.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        const { orders, total, totalToday } = action.payload;
        state.feed = { orders, total, totalToday, isLoading: false, error: null };
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.feed.isLoading = false;
        state.feed.error = action.error.message;
      })
      .addCase(fetchHistory.pending, (state, action) => {
        state.history.isLoading = true;
        state.history.error = null;
        state.history.requestId = action.meta.requestId;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        if (state.history.requestId !== action.meta.requestId) return;
        state.history.orders = action.payload;
        state.history.isLoading = false;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        if (state.history.requestId !== action.meta.requestId) return;
        state.history.isLoading = false;
        state.history.error = action.error.message ?? 'Не удалось загрузить историю';
      })
      .addCase(fetchOrder.pending, (state, action) => {
        state.detail = {
          order: null,
          isLoading: true,
          error: null,
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        if (state.detail.requestId !== action.meta.requestId) return;
        state.detail.order = action.payload;
        state.detail.isLoading = false;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        if (state.detail.requestId !== action.meta.requestId) return;
        state.detail.isLoading = false;
        state.detail.error = action.error.message ?? 'Не удалось загрузить заказ';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.history = initialState.history;
        state.detail = initialState.detail;
      });
  },
});
export default feedSlice.reducer;