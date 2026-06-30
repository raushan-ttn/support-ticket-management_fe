import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/services/baseApi';
import authReducer from './authSlice';
import '@/services/auth-api';
import '@/services/ticket-api';
import '@/services/comment-api';

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
