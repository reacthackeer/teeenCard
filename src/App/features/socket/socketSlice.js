import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    socket: null,
    connected: false
}

const socketSlice = createSlice({
    name: 'machine',
    initialState,
    reducers: {
        socketConnected: (state, action) => {
            state.socket = action.payload.engine;
            state.connected = action.payload.engineConnected
        },
        socketDisconnected: (state, action) => {
            state.socket = action.payload.engine;
            state.connected = action.payload.engineConnected
        }
    }
})

export const {socketConnected, socketDisconnected} = socketSlice.actions;
export default socketSlice.reducer;
