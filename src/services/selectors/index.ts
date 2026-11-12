import type { RootState } from '../store';
import type { TOrder } from '@utils-types';

export const selectUser = (state: RootState): RootState['user'] => state.user;
export const selectConstructor = (state: RootState): RootState['burgerConstructor'] =>
  state.burgerConstructor;
export const selectOrder = (state: RootState): RootState['order'] => state.order;
export const selectFeed = (state: RootState): RootState['orders']['feed'] =>
  state.orders.feed;
export const selectHistory = (state: RootState): RootState['orders']['history'] =>
  state.orders.history;
export const selectOrderDetail = (state: RootState): RootState['orders']['detail'] =>
  state.orders.detail;

export const selectOrderByNumber = (
  state: RootState,
  orderNumber: number
): TOrder | undefined =>
  state.orders.feed.orders.find((order) => order.number === orderNumber) ??
  state.orders.history.orders.find((order) => order.number === orderNumber) ??
  (state.orders.detail.order?.number === orderNumber
    ? state.orders.detail.order
    : undefined);

export const selectPassword = (state: RootState): RootState['password'] =>
  state.password;
