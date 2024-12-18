import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { api } from "./features/api-slice";
import { configSlice } from "./features/config/slice";
import { githubApi } from "./features/git/gitApi";
import mediaSlice from "./features/media-manager/slice";

export const store = configureStore({
  reducer: {
    [configSlice.name]: configSlice.reducer,
    [mediaSlice.name]: mediaSlice.reducer,
    [api.reducerPath]: api.reducer,
    [githubApi.reducerPath]: githubApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(githubApi.middleware, api.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

setupListeners(store.dispatch);
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
