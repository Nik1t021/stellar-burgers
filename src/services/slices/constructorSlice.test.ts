import constructorReducer, {
  addIngredient,
  clearConstructor,
  moveIngredient,
  removeIngredient,
} from './constructorSlice';

import type { TConstructorState, TIngredient } from '@utils-types';

const filling: TIngredient = {
  _id: 'filling',
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

const bun: TIngredient = {
  ...filling,
  _id: 'bun',
  name: 'Тестовая булка',
  type: 'bun',
};

const emptyState: TConstructorState = { bun: null, ingredients: [] };
const firstFilling = { ...filling, id: 'first' };
const secondFilling = { ...filling, id: 'second' };
const filledState: TConstructorState = {
  bun: { ...bun, id: 'old-bun' },
  ingredients: [firstFilling, secondFilling],
};

describe('burgerConstructor reducer', () => {
  test('возвращает начальное состояние при неизвестном экшене', () => {
    expect(constructorReducer(undefined, { type: 'UNKNOWN' })).toEqual(emptyState);
  });

  test('addIngredient заменяет булку и сохраняет начинки', () => {
    const action = addIngredient({ ...bun, _id: 'new-bun' });

    expect(constructorReducer(filledState, action)).toEqual({
      ...filledState,
      bun: action.payload,
    });
  });

  test('addIngredient добавляет начинку в конец списка', () => {
    const action = addIngredient(filling);

    expect(constructorReducer(filledState, action)).toEqual({
      ...filledState,
      ingredients: [firstFilling, secondFilling, action.payload],
    });
  });

  test('removeIngredient удаляет экземпляр по id в конструкторе', () => {
    expect(constructorReducer(filledState, removeIngredient(firstFilling.id))).toEqual({
      ...filledState,
      ingredients: [secondFilling],
    });
  });

  test('moveIngredient меняет порядок начинок', () => {
    expect(constructorReducer(filledState, moveIngredient({ from: 0, to: 1 }))).toEqual({
      ...filledState,
      ingredients: [secondFilling, firstFilling],
    });
  });

  test('clearConstructor удаляет булку и все начинки', () => {
    expect(constructorReducer(filledState, clearConstructor())).toEqual(emptyState);
  });
});
