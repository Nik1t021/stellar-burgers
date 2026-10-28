import { combineReducers } from '@reduxjs/toolkit';

import constructorReducer from './slices/constructorSlice';
import ordersReducer from './slices/feedSlice';
import ingredientsReducer from './slices/ingredientsSlice';
import orderReducer from './slices/orderSlice';
import passwordReducer from './slices/passwordSlice';
import userReducer from './slices/userSlice';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  password: passwordReducer,
  user: userReducer,
  burgerConstructor: constructorReducer,
  order: orderReducer,
  orders: ordersReducer,
});

