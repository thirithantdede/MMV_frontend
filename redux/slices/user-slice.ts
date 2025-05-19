import config from '@/config';
import { UserGlobal } from '@/types';
import { EncryptStorage } from '@/utils/encrypt-storage';
import { createSlice } from '@reduxjs/toolkit';
import { UserRootState } from '../stores/user-store';

const secretKey = config.secretKey;
const ens_storage = new EncryptStorage(secretKey);
const storedUser = JSON.parse(ens_storage.get('user')!) ?? null;

const userInitialState: UserGlobal = {
  isAuth: false,
  user: storedUser,
};

export const userState = createSlice({
  name : "userState",
  initialState:userInitialState,
  reducers: {
    setUser(state,action){
      state.isAuth = true
      state.user = action.payload
      ens_storage.set('user', JSON.stringify(action.payload));
    },
    setUserLogout(state,action){
      state.user = null;
      state.isAuth = false;
       ens_storage.remove('user');
    }

  }
})


export const { setUser,setUserLogout } = userState.actions;
export default userState.reducer;

export const selectUserState = (state : UserRootState) => state.userState;