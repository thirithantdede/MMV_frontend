import { UserGlobal } from '@/types';
import { createSlice } from '@reduxjs/toolkit';
import { UserRootState } from '../stores/user-store';

const userInitialState: UserGlobal = {
  isAuth: false,
  user: null,
};

export const userState = createSlice({
  name : "userState",
  initialState:userInitialState,
  reducers: {
    setUser(state,action){
      state.isAuth = true
      state.user = action.payload
    },
    setUserLogout(state){
      state.user = null;
      state.isAuth = false;
    }

  }
})


export const { setUser,setUserLogout } = userState.actions;
export default userState.reducer;

export const selectUserState = (state : UserRootState) => state.userState;