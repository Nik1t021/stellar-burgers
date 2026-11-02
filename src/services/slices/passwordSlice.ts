import { forgotPasswordApi, resetPasswordApi } from "@api";
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';

const initialState= { isLoading: false, error: null as string | null };
export const requestPasswordReset = createAsyncThunk(
    'password/request',
    async (email: string) => {
  await forgotPasswordApi({ email });
  localStorage.setItem('resetPassword', 'true');
    }
);
export const resetPassword = createAsyncThunk(
    'password/reset',
    async (values: { password: string; token: string }) => {
        await resetPasswordApi(values);
        localStorage.removeItem('resetPassword');
    }
);
const passwordSlice = createSlice({
    name: 'password',
    initialState,
    reducers: {
        clearPasswordError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(
                isAnyOf(requestPasswordReset.pending, resetPassword.pending),
                (state) => {
                    state.isLoading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                isAnyOf(requestPasswordReset.fulfilled, resetPassword.fulfilled),
                (state) => {
                    state.isLoading = false;
                }
            )
            .addMatcher(
                isAnyOf(requestPasswordReset.rejected, resetPassword.rejected),
                (state, action) => {
                    state.isLoading = false;
                    state.error = action.error.message ?? 'Не удалось выполнить запрос';
                }
            );
    },
});
export const { clearPasswordError } = passwordSlice.actions;
export default passwordSlice.reducer;
