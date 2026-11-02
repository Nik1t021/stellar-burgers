import { getUserApi, loginUserApi, logoutApi, getOrdersApi, orderBurgerApi } from '@api';
import { configureStore } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

import { rootReducer } from '../rootReducer';
import { fetchHistory } from './feedSlice';
import { createOrder } from './orderSlice';
import { checkAuth, loginUser, logoutUser } from './userSlice';

import type { TOrder } from '@utils-types';

jest.mock('@api');
jest.mock('@utils/cookie');
const user = { name: 'Никита', email: 'test@example.com' };
const authResponse = {
  success: true,
  user,
  accessToken: 'Bearer access',
  refreshToken: 'refresh',
};
const values = { email: user.email, password: 'password' };
const storage = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string): string | null => storage.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      storage.set(key, value);
    },
    removeItem: (key: string): void => {
      storage.delete(key);
    },
  },
});
beforeEach(() => {
  jest.resetAllMocks();
  storage.clear();
});

test('без токенов сессия проверена без запроса приватных данных', async () => {
  const store = configureStore({ reducer: rootReducer });
  await store.dispatch(checkAuth());
  expect(store.getState().user.isAuthChecked).toBe(true);
  expect(store.getState().user.user).toBeNull();
  expect(getUserApi).not.toHaveBeenCalled();
});

test('вход сохраняет оба токена и пользователя', async () => {
  jest.mocked(loginUserApi).mockResolvedValue(authResponse);
  const store = configureStore({ reducer: rootReducer });
  await store.dispatch(loginUser(values));
  expect(loginUserApi).toHaveBeenCalledWith(values);
  expect(setCookie).toHaveBeenCalledWith('accessToken', 'Bearer access');
  expect(localStorage.getItem('refreshToken')).toBe('refresh');
  expect(store.getState().user.user).toEqual(user);
});

test('ошибка входа не сохраняет токены и позволяет повторить запрос', async () => {
  jest.mocked(loginUserApi).mockRejectedValueOnce(new Error('Неверный пароль'));
  const store = configureStore({ reducer: rootReducer });
  await store.dispatch(loginUser(values));
  expect(store.getState().user.error).toBe('Неверный пароль');
  expect(store.getState().user.isLoading).toBe(false);
  expect(setCookie).not.toHaveBeenCalled();
  jest.mocked(loginUserApi).mockResolvedValueOnce(authResponse);
  await store.dispatch(loginUser(values));
  expect(store.getState().user.user).toEqual(user);
  expect(store.getState().user.error).toBeNull();
});

test('отказ проверки токена закрывает сессию и удаляет токены', async () => {
  jest.mocked(getCookie).mockReturnValue('invalid');
  localStorage.setItem('refreshToken', 'invalid');
  jest.mocked(getUserApi).mockRejectedValue(new Error('Token is invalid'));
  const store = configureStore({ reducer: rootReducer });
  await store.dispatch(checkAuth());
  expect(store.getState().user.isAuthChecked).toBe(true);
  expect(store.getState().user.user).toBeNull();
  expect(deleteCookie).toHaveBeenCalledWith('accessToken');
  expect(localStorage.getItem('refreshToken')).toBeNull();
});

test('ошибка выхода не удаляет действующую сессию', async () => {
  jest.mocked(loginUserApi).mockResolvedValue(authResponse);
  jest.mocked(logoutApi).mockRejectedValue(new Error('Сервер недоступен'));
  const store = configureStore({ reducer: rootReducer });
  await store.dispatch(loginUser(values));
  await store.dispatch(logoutUser());
  expect(store.getState().user.user).toEqual(user);
  expect(localStorage.getItem('refreshToken')).toBe('refresh');
  expect(deleteCookie).not.toHaveBeenCalled();
});

test('запоздавший ответ истории после выхода не возвращает приватные данные', async () => {
  jest.mocked(loginUserApi).mockResolvedValue(authResponse);
  jest.mocked(logoutApi).mockResolvedValue({ success: true });
  let resolveHistory!: (orders: TOrder[]) => void;
  jest.mocked(getOrdersApi).mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveHistory = resolve;
      })
  );
  const store = configureStore({ reducer: rootReducer });
  await store.dispatch(loginUser(values));
  const request = store.dispatch(fetchHistory());
  await store.dispatch(logoutUser());
  resolveHistory([
    {
      _id: 'private',
      number: 1,
      status: 'done',
      name: 'Бургер',
      ingredients: [],
      createdAt: '',
      updatedAt: '',
    },
  ]);
  await request;
  expect(store.getState().orders.history.orders).toEqual([]);
  expect(store.getState().user.user).toBeNull();
});

test('гость не может отправить запрос создания заказа через thunk', async () => {
  const store = configureStore({ reducer: rootReducer });
  await store.dispatch(createOrder(['bun', 'main', 'bun']));
  expect(orderBurgerApi).not.toHaveBeenCalled();
});

test('ответ заказа, завершившийся после выхода, не возвращает данные в store', async () => {
  jest.mocked(loginUserApi).mockResolvedValue(authResponse);
  jest.mocked(logoutApi).mockResolvedValue({ success: true });
  let resolveOrder!: (data: Awaited<ReturnType<typeof orderBurgerApi>>) => void;
  jest.mocked(orderBurgerApi).mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveOrder = resolve;
      })
  );
  const store = configureStore({ reducer: rootReducer });
  await store.dispatch(loginUser(values));
  const request = store.dispatch(createOrder(['bun', 'main', 'bun']));
  await store.dispatch(logoutUser());
  resolveOrder({
    success: true,
    name: 'Бургер',
    order: {
      _id: 'private',
      number: 1,
      status: 'done',
      name: 'Бургер',
      ingredients: [],
      createdAt: '',
      updatedAt: '',
    },
  });
  await request;
  expect(store.getState().order.order).toBeNull();
  expect(getOrdersApi).not.toHaveBeenCalled();
});