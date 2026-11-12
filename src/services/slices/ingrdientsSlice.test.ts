import { getIngredientsApi } from '@api';
import { configureStore } from '@reduxjs/toolkit';

import { rootReducer } from '../rootReducer';
import ingredientsReducer, { fetchIngredients } from './ingredientsSlice';

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

describe('ingredients reducer', () => {
  const ingredient: TIngredient = {
    _id: 'ingredient-1',
    name: 'Тестовая начинка',
    type: 'main',
    proteins: 10,
    fat: 10,
    carbohydrates: 10,
    calories: 100,
    price: 50,
    image: '',
    image_mobile: '',
    image_large: '',
  };

  test('возвращает начальное состояние при неизвестном экшене', () => {
    expect(ingredientsReducer(undefined, { type: 'UNKNOWN' })).toEqual({
      items: [],
      status: 'idle',
      error: null,
    });
  });

  test('pending запускает загрузку и сбрасывает предыдущую ошибку', () => {
    const state = {
      items: [ingredient],
      status: 'failed' as const,
      error: 'Предыдущая ошибка',
    };

    expect(
      ingredientsReducer(state, fetchIngredients.pending('request-1', undefined))
    ).toEqual({ items: [ingredient], status: 'loading', error: null });
  });

  test('fulfilled сохраняет полученные ингредиенты', () => {
    const state = { items: [], status: 'loading' as const, error: null };

    expect(
      ingredientsReducer(
        state,
        fetchIngredients.fulfilled([ingredient], 'request-1', undefined)
      )
    ).toEqual({ items: [ingredient], status: 'succeeded', error: null });
  });

  test('rejected сохраняет ошибку и завершает загрузку', () => {
    const state = { items: [ingredient], status: 'loading' as const, error: null };
    const action = fetchIngredients.rejected(
      new Error('Сервер недоступен'),
      'request-1',
      undefined
    );

    expect(ingredientsReducer(state, action)).toEqual({
      items: [ingredient],
      status: 'failed',
      error: 'Сервер недоступен',
    });
  });
});
