import { getIngredientsApi } from "@api";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TIngredient } from '@utils-types';

export type IngredientsState = {
    items: TIngredient[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
};

const initialState: IngredientsState = {
    items: [],
    status: 'idle',
    error: null,
};

export const fetchIngredients = createAsyncThunk(
    'ingredients/fetch',
    getIngredientsApi,
    {
        condition: (_, { getState }) => {
            const { ingredients } = getState() as { ingredients: IngredientsState };
            return ingredients.status !== 'loading';
        },
    }
);

const ingredientsSlice = createSlice({
    name: 'ingredients',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchIngredients.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchIngredients.fulfilled, (state, action) => {
                state.items = action.payload;
                state.status = 'succeeded';
            })
            .addCase(fetchIngredients.rejected, (state, action) => {
                state.status ='failed';
                state.error = action.error.message ?? 'Не удалось загрузить ингредиенты';
            });
    },
});

export default ingredientsSlice.reducer;
