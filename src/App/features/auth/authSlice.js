import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    isLoggedIn: false,
    isFilled: false,
    token: '',
    auth: {}
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: { 
        userLoggedIn: (state, action) => {
            state.auth = action.payload.auth;
            state.isLoggedIn = action.payload.isLoggedIn;
            state.token = action.payload.token
            state.isFilled = action.payload.isFilled;
        },
        userLoggedOut: (state, action) => {
            state.auth = action.payload.auth;
            state.token = action.payload.token
            state.isLoggedIn = action.payload.isLoggedIn;
            state.isFilled = action.payload.isFilled;
        },
        updateUserAuthInfo: (state, action) => {
            state.auth = action.payload.auth;
        },
        userBalanceIncrement: (state, action) => {
            state.auth[action.payload.balanceType] = Number(state.auth[action.payload.balanceType]) + Number(action.payload.amount)
        },
        userBalanceDecrement: (state, action) => {
            state.auth[action.payload.balanceType] = Number(state.auth[action.payload.balanceType]) - Number(action.payload.amount)
        },
        userReset: (state, action) => {
            state.isLoggedIn = false;
            state.isFilled = false;
            state.token = '';
            state.auth = {};
        },
    }
});

export const {
    userBalanceDecrement,
    userLoggedIn, 
    userLoggedOut, 
    updateUserAuthInfo,
    userBalanceIncrement,
    userReset
} = authSlice.actions;
export default authSlice.reducer;