import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    isFilled: false,
    data: [],
    isLoading: true
}

const depositRequestSlice = createSlice({
    name: 'depositRequest',
    initialState,
    reducers: { 
        addAllDepositRequest: (state, action) => {
            state.data = action.payload;
            state.isFilled = true;
            state.isLoading = false;
        }, 
        resetDepositRequest: (state, action) => {
            state.data = [];
            state.isFilled = false;
            state.isLoading = true;
        }
    }
});

export const {
    addAllDepositRequest,
    resetDepositRequest
} = depositRequestSlice.actions;
export default depositRequestSlice.reducer;