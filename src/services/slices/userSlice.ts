import {
    getUserApi,
    loginUserApi,
    registerUserApi,
    logoutApi,
    updateUserApi,
    refreshToken,
} from '@api';
import { createAsyncThunk, createSlice, isAnyof } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';