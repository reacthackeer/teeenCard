import { apiSlice } from "../Api/ApiSlice";

export const walletApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({ 
        addSingleWithdrawalRequest: builder.mutation({
            query: (walletInfo) => ({
                url: `/withdrawal-request/create/`,
                method: 'POST', 
                body: walletInfo
            }),
            invalidatesTags: ()=> [{type: 'getAllWithdrawalRequest'}]
        }), 
        getAllWithdrawalRequest: builder.query({
            query: () => ({
                url: `/withdrawal-request/get-all/`,
                method: 'GET'
            }),
            providesTags: ()=> [{type: 'getAllWithdrawalRequest'}]
        }), 
        deleteSingleWithdrawalRequest: builder.mutation({
            query: (walletId) => ({
                url: `/withdrawal-request/delete`,
                method: 'DELETE', 
                body: walletId
            }),
            invalidatesTags: ()=> [{type: 'getAllWithdrawalRequest'}]
        }),  
        confirmSingleWithdrawalRequest: builder.mutation({
            query: (walletId) => ({
                url: `/withdrawal-request/confirm`,
                method: 'POST', 
                body: walletId
            }),
            invalidatesTags: ()=> [{type: 'getAllWithdrawalRequest'}]
        }), 
        blockSingleWithdrawalRequest: builder.mutation({
            query: (walletId) => ({
                url: `/withdrawal-request/block`,
                method: 'DELETE', 
                body: walletId
            }),
            invalidatesTags: ()=> [{type: 'getAllWithdrawalRequest'}]
        }), 
    })
})
                                                                                                
export const {   
    useAddSingleWithdrawalRequestMutation,
    useGetAllWithdrawalRequestQuery,
    useDeleteSingleWithdrawalRequestMutation,
    useBlockSingleWithdrawalRequestMutation,
    useConfirmSingleWithdrawalRequestMutation
} = walletApi;