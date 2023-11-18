import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./features/Api/ApiSlice";
import homeSlice from "./features/Home/homeSlice";
import authSlice from "./features/auth/authSlice";
import boardSlice from './features/board/boardSlice';
import depositRequest from "./features/depositRequest/depositRequest";
import roomSlice from './features/room/roomSlice';
import socketSlice from "./features/socket/socketSlice";
import withdrawalRequest from "./features/withdrawalRequest/withdrawalRequest";
const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authSlice,
        board: boardSlice,
        room: roomSlice,
        home: homeSlice,
        socket: socketSlice,
        depositRequest:  depositRequest,
        withdrawalRequest: withdrawalRequest
    },
    devTools: false,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware)
})
const serverPort = 'http://localhost:3000'
export {
    serverPort, store
};

