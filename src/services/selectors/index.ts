import type { RootState } from '../store';

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

export const selectPassword = (state: RootState): RootState['password'] =>
    state.password;
