import {
    createApi,
    fetchBaseQuery
} from '@reduxjs/toolkit/query/react';
import { userLoggedOut } from '../auth/authSlice';
const baseQuery = fetchBaseQuery({
    baseUrl: `http://localhost:3000/api/v1`,
    prepareHeaders: async (headers,{getState}) => {
        const token = getState()?.auth?.token; 
        if(token){
            headers.set('authorization', `Bearer ${token}`)
        }
        return headers;
    }
})

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: async (args, api, extraOptions) => {
        let result = await baseQuery(args, api, extraOptions);
        // todo validate user authentication
        if(result?.error?.status === 401){
            api.dispatch(userLoggedOut({
                auth: {},
                isLoggedIn: false,
                isFilled: false,
                token: ''
            }))
            localStorage.removeItem('token') 
            window.location.assign('/login'); 
        }
        return result;
    },
    tagTypes: [],
    endpoints: (builder) => ({})
})