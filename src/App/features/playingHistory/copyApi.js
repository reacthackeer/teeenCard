import { apiSlice } from "../Api/ApiSlice";

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSingleUserPlayingHistory: builder.query({
            query: ({userId, page}) => ({
                url: `/playing-history/get-all/${userId}?page=${page}`,
                method: 'GET', 
            })
        }),
        getSinglePlayingHistory: builder.query({
            query: ({userId, id}) => ({
                url: `/playing-history/get-single/${userId}/${id}`,
                method: 'GET', 
            })
        })
    })
})

export const { 
    useGetSinglePlayingHistoryQuery, 
    useGetSingleUserPlayingHistoryQuery,
} = authApi;