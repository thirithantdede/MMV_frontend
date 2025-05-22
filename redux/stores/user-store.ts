import { configureStore } from "@reduxjs/toolkit";
import { userState } from "../slices/user-slice";
import { queryApi } from "@/utils/query-api";

export const userStore = configureStore({
    reducer:{
        [queryApi.reducerPath]: queryApi.reducer,
        userState : userState.reducer
    },
    middleware: (getDefaultMiddleware)=> getDefaultMiddleware().concat(queryApi.middleware),
    
}); 

export type UserRootState = ReturnType<typeof userStore.getState>; // Typing the user store
export type UserAppDispatch = typeof userStore.dispatch;