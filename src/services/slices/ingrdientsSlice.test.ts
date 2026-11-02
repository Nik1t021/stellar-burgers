import { getIngredientsApi } from '@api';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../rootReducer';
import { fetchIngredients } from './ingredientsSlice';
import type { TIngredient } from '@utils-types';
jest.mock('@api', () => ({ getIngredientsApi: jest.fn() }));
const getIngredientsMock = jest.mocked(getIngredientsApi);
beforeEach(() => jest.resetAllMocks());
test('повторный dispatch во время загрузки не создаёт второй запрос', async () => {
  let resolveRequest!: (ingredients: TIngredient[]) => void;
  getIngredientsMock.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
  );
  const store = configureStore({ reducer: rootReducer });
  const request = store.dispatch(fetchIngredients());
  await store.dispatch(fetchIngredients());
  expect(getIngredientsMock).toHaveBeenCalledTimes(1);
  expect(store.getState().ingredients.status).toBe('loading');
  resolveRequest([]);
  await request;
  expect(store.getState().ingredients.status).toBe('succeeded');
});
test('после ошибки пользователь может повторить загрузку', async () => {
  getIngredientsMock.mockRejectedValueOnce(new Error('Сервер недоступен'));
  const store = configureStore({ reducer: rootReducer });
  await store.dispatch(fetchIngredients());
  expect(store.getState().ingredients.error).toBe('Сервер недоступен');
  expect(store.getState().ingredients.status).toBe('failed');
  getIngredientsMock.mockResolvedValueOnce([]);
  await store.dispatch(fetchIngredients());
  expect(store.getState().ingredients.status).toBe('succeeded');
  expect(store.getState().ingredients.error).toBeNull();
});