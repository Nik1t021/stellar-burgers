import {
    getUserApi,
    loginUserApi,
    registerUserApi,
    logoutApi,
    updateUserApi,
    refreshToken,
} from '@api';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { TUser } from '@utils-types';

export type UserState = {
    user: TUser | null;
    isAuthChecked: boolean;
    isChecking: boolean;
    isLoading: boolean;
    error: string | null;
};
const initialState: UserState = {
    user: null,
    isAuthChecked: false,
    isChecking: false,
    isLoading: false,
    error: null,
};
const clearTokens = (): void => {
    deleteCookie('accessToken');
    localStorage.removeItem('refreshToken');
};
const saveTokens = (data: { accessToken: string; refreshToken: string }): void => {
    setCookie('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
};
export const checkAuth = createAsyncThunk(
    'user/checkAuth',
    async () => {
        if (!getCookie('accessToken') && !localStorage.getItem('refreshToken')) return null;
        try {
            if (!getCookie('accessToken')) await refreshToken();
            const data = await getUserApi();
            if (!data.success) throw new Error('Не удалось проверить авторизацию');
            return data.user;
        } catch (error) {
            clearTokens();
            throw error;
        }
    },
    {
        condition: (_, { getState }) => {
            const { user } = getState() as { user: UserState };
            return !user.isChecking && !user.isAuthChecked;
        },
    }
);
const canRequest = (
  _: unknown,
  { getState }: { getState: () => unknown }
): boolean => !(getState() as { user: UserState }).user.isLoading;

export const loginUser = createAsyncThunk(
    'user/login',
    async (values: TLoginData) => {
        const data = await loginUserApi(values);
        saveTokens(data);
        return data.user;
    },
    { condition: canRequest }
);
export const registerUser = createAsyncThunk(
    'user/register',
    async (values: TRegisterData) => {
        const data = await registerUserApi(values);
        saveTokens(data);
        return data.user;
    },
    { condition: canRequest }
);
export const updateUser = createAsyncThunk(
    'user/update',
    async (values: Partial<TRegisterData>) => {
        const data = await updateUserApi(values);
        if (!data.success) throw new Error('Не удалось сохранить профиль');
        return data.user;
    },
    { condition: canRequest }
);
export const logoutUser = createAsyncThunk<void, void>(
    'user/logout',
    async () => {
        const data = await logoutApi();
        if (!data.success) throw new Error('Не удалось выйти из аккаунта');
        clearTokens();
    },
    { condition: canRequest }
);
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUserError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkAuth.pending, (state) => {
                state.isChecking = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isChecking = false;
                .addCase(checkAuth.rejected, (state) => {
            })
            .addCase(checkAuth.reject, (state) => {
                state.user = null;
                state.isChecking = false;
                state.isAuthChecked = true;
            })
            .addCase(logoutUser. fulfilled, (state) => {
                state.user = null;
                state.isLoading = false;
                state.isAuthChecked = true;
            })
            .addMatcher(
                isAnyOf(
                    loginUser.pending,
                    registerUser.pending,
                    updateUser.pending,
                    logoutUser.pending
                ),
                (state) => {
                    state.isLoading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                isAnyOf(loginUser.fulfilled, registerUser.fulfilled, updateUser.fulfilled),
                (state, action) => {
                    state.user = action.payload;
                    state.isLoading = false;
                    state.isAuthChecked = true;
                }
            )
            .addMatcher(
               isAnyOf(
                    loginUser.rejected,
                    registerUser.rejected,
                    updateUser.rejected,
                    logoutUser.rejected
                ),
                (state, action) => {
                    state.isLoading = false;
                    state.error = action.error.message ?? 'Не удалось выполнить запрос';
                }
            );
    },
});
export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
