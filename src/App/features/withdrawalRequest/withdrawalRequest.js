import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    isFilled: false,
    data: [],
    isLoading: true
}

const withdrawalRequestSlice = createSlice({
    name: 'withdrawalRequest',
    initialState,
    reducers: { 
        addAllWithdrawalRequest: (state, action) => {
            state.data = action.payload;
            state.isFilled = true;
            state.isLoading = false;
        }, 
        resetWithdrawalRequest: (state, action) => {
            state.data = [];
            state.isFilled = false;
            state.isLoading = true;
        }
    }
});

export const {
    addAllWithdrawalRequest,
    resetWithdrawalRequest
} = withdrawalRequestSlice.actions;
export default withdrawalRequestSlice.reducer;