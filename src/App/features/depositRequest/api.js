import { apiSlice } from "../Api/ApiSlice";

export const walletApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({ 
        addSingleDepositRequest: builder.mutation({
            query: (walletInfo) => ({
                url: `/deposit-request/create/`,
                method: 'POST', 
                body: walletInfo
            }),
            invalidatesTags: ()=> [{type: 'getAllDepositRequest'}]
        }), 
        getAllDepositRequest: builder.query({
            query: () => ({
                url: `/deposit-request/get-all/`,
                method: 'GET'
            }),
            providesTags: ()=> [{type: 'getAllDepositRequest'}]
        }), 
        deleteSingleDepositRequest: builder.mutation({
            query: (walletId) => ({
                url: `/deposit-request/delete`,
                method: 'DELETE', 
                body: walletId
            }),
            invalidatesTags: ()=> [{type: 'getAllDepositRequest'}]
        }),  
        confirmSingleDepositRequest: builder.mutation({
            query: (walletId) => ({
                url: `/deposit-request/confirm`,
                method: 'POST', 
                body: walletId
            }),
            invalidatesTags: ()=> [{type: 'getAllDepositRequest'}]
        }), 
        blockSingleDepositRequest: builder.mutation({
            query: (walletId) => ({
                url: `/deposit-request/block`,
                method: 'DELETE', 
                body: walletId
            }),
            invalidatesTags: ()=> [{type: 'getAllDepositRequest'}]
        }), 
    })
})
                                                                                                
export const {   
    useAddSingleDepositRequestMutation,
    useGetAllDepositRequestQuery,
    useDeleteSingleDepositRequestMutation,
    useBlockSingleDepositRequestMutation,
    useConfirmSingleDepositRequestMutation
} = walletApi;