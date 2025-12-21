import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from '@/services/api';
import tasksReducer from '@/features/tasks/tasksSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    tasks: tasksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
