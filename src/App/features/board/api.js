import { apiSlice } from "../Api/ApiSlice";

export const boardApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({ 
        addSingleBoard: builder.mutation({
            query: (boardInfo) => ({
                url: `/board/create/`,
                method: 'POST', 
                body: boardInfo
            })
        }),
        deleteSingleBoard: builder.mutation({
            query: ({id, userId, roomId}) => ({
                url: `/board/delete`,
                method: "DELETE",  
                body: {id, userId, roomId}
            })
        }),
        joinInRoom: builder.mutation({
            query: ({userId, roomId, id}) => ({
                url: `/board/join`,
                method: "PUT",  
                body: {id, userId, roomId}
            })
        }),
        joinInRoomPrivate: builder.mutation({
            query: ({userId, roomId, id}) => ({
                url: `/board/join-private`,
                method: "PUT",  
                body: {id, userId, roomId}
            })
        }),
        leaveInRoom: builder.mutation({
            query: ({userId, roomId, id}) => ({
                url: `/board/leave`,
                method: "PUT",  
                body: {id, userId, roomId}
            })
        }),
        getAllBoard: builder.query({
            query: (page) => ({
                url: `/board/get-all?page=${page}`,
                method: 'GET',  
            })
        }),
        checkSocket: builder.mutation({
            query: () => ({
                url: '/board/check',
                method: 'POST'
            })
        })
    })
})

export const {  
    useJoinInRoomPrivateMutation,
    useLeaveInRoomMutation,
    useJoinInRoomMutation,
    useDeleteSingleBoardMutation,
    useAddSingleBoardMutation, 
    useGetAllBoardQuery,
    useCheckSocketMutation
} = boardApi;