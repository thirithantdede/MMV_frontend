import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { UserAppDispatch, UserRootState } from './stores/userStore'

// Use throughout your app instead of plain `useDispatch` and `useSelector`

export const useUserAppDispatch: () => UserAppDispatch = useDispatch;
export const useUserAppSelector: TypedUseSelectorHook<UserRootState> = useSelector;

export type AppDispatch = AdminAppDispatch | UserAppDispatch;
export type RootState = AdminRootState | UserRootState;
