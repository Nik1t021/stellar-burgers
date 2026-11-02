import type { IngredientsState } from '../slices/ingredientsSlice';
import type { RootState } from '../store';
import type { TIngredient } from '@/utils/types';

export const selectIngredients = (state: RootState): TIngredient[] =>
  state.ingredients.items;

export const selectIngredientsStatus = (state: RootState): IngredientsState['status'] =>
  state.ingredients.status;

export const selectIngredientsError = (state: RootState): string | null =>
  state.ingredients.error;
