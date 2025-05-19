import { configureStore } from "@reduxjs/toolkit";
import { userState } from "../slices/user-slice";

export const userStore = configureStore({
    reducer:{
        userState : userState.reducer
    },
}); 

export type UserRootState = ReturnType<typeof userStore.getState>; // Typing the user store
export type UserAppDispatch = typeof userStore.dispatch;