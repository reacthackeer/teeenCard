import { apiSlice } from "../Api/ApiSlice";

export const roomApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({ 
        getMyRoom: builder.query({
            query: ({roomId, userId}) => ({
                url: `/board/room/${roomId}/${userId}`,
                method: 'GET',  
            })
        }),
        enterPlayerInRoom: builder.mutation({
            query: ({userId, roomId, id}) => ({ 
                url: `/board/enter-player-in-room`,
                method: "PUT",  
                body: {id, userId, roomId} 
            })
        }),
        leavePlayerInRoom: builder.mutation({
            query: ({userId, roomId, id}) => ({ 
                url: `/board/leave-player-in-room`,
                method: "PUT",  
                body: {id, userId, roomId} 
            })
        }),
        startRoom: builder.mutation({
            query: ({roomId, id, userId}) => ({
                url: `/board/start-room`,
                method: "PUT",  
                body: {id, userId, roomId} 
            })
        }),
        seeMyPlayingCard: builder.mutation({
            query: ({roomId, id, userId}) =>({
                url: `/board/see-my-card`,
                method: "PUT",  
                body: {id, userId, roomId} 
            })
        }),
        packUpMyCard: builder.mutation({
            query: ({roomId, id, userId}) =>({
                url: `/board/pack-up-my-card`,
                method: "PUT",  
                body: {id, userId, roomId} 
            })
        }),
        hitBlindOneExe: builder.mutation({
            query: ({roomId, id, userId}) =>({
                url: `/board/blind-one-exe`,
                method: "PUT",  
                body: {id, userId, roomId} 
            })
        }),
        hitBlindTwoExe: builder.mutation({
            query: ({roomId, id, userId}) =>({
                url: `/board/blind-two-exe`,
                method: "PUT",  
                body: {id, userId, roomId} 
            })
        }),
        hitChaalOneExe: builder.mutation({
            query: ({roomId, id, userId}) =>({
                url: `/board/chaal-one-exe`,
                method: "PUT",  
                body: {id, userId, roomId} 
            })
        }),
        hitChaalTwoExe: builder.mutation({
            query: ({roomId, id, userId}) =>({
                url: `/board/chaal-two-exe`,
                method: "PUT",  
                body: {id, userId, roomId} 
            })
        }),
        sideMyCard: builder.mutation({
            query: ({roomId, id, userId}) =>({
                url: `/board/side-my-card`,
                method: "PUT",  
                body: {id, userId, roomId} 
            })
        }),
        showMyCard: builder.mutation({
            query: ({roomId, id, userId}) =>({
                url: `/board/show-my-card`,
                method: "PUT",  
                body: {id, userId, roomId} 
            })
        }), 
        validateUser: builder.mutation({
            query: ({roomId, id, userId}) =>({
                url: `/board/validate-user`,
                method: "PUT",  
                body: {id, userId, roomId} 
            })
        }), 
    })
})

export const {  
    useHitBlindOneExeMutation,
    useHitBlindTwoExeMutation,
    useHitChaalOneExeMutation,
    useHitChaalTwoExeMutation,
    useSeeMyPlayingCardMutation,
    usePackUpMyCardMutation,
    useStartRoomMutation,
    useLeavePlayerInRoomMutation,
    useEnterPlayerInRoomMutation,
    useGetMyRoomQuery,
    useSideMyCardMutation,
    useShowMyCardMutation,
    useValidateUserMutation
} = roomApi;