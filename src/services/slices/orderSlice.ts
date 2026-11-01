import { orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { clearConstructor } from './constructorSlice';
import { fetchFeed, fetchHistory } from './feedSlice';
import { logoutUser } from './userSlice';
import type { TOrder } from '@utils-types';
export type OrderState = {
  isLoading: boolean;
  order: TOrder | null;
  error: string | null;
  requestId: string;
};
const initialState: OrderState = {
  isLoading: false,
  order: null,
  error: null,
  requestId: '',
};
export const createOrder = createAsyncThunk(
  'order/create',
  async (ingredients: string[], { dispatch, getState, requestId }) => {
    const data = await orderBurgerApi(ingredients);
    if ((getState() as { order: OrderState }).order.requestId !== requestId)
      return data.order;
    dispatch(clearConstructor());
    void dispatch(fetchFeed());
    void dispatch(fetchHistory());
    return data.order;
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { user: { user: unknown }; order: OrderState };
      return Boolean(state.user.user) && !state.order.isLoading;
    },
  }
);
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.order = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state, action) => {
        state.requestId = action.meta.requestId;
        state.isLoading = true;
        state.error = null;
        state.order = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.isLoading = false;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось оформить заказ';
      })
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});
export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;