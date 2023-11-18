import { apiSlice } from "../Api/ApiSlice";

export const walletApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({ 
        addSingleWallet: builder.mutation({
            query: (walletInfo) => ({
                url: `/wallet/create/`,
                method: 'POST', 
                body: walletInfo
            }),
            invalidatesTags: ()=> [{type: 'getAllWallet'}]
        }), 
        getAllWallet: builder.query({
            query: () => ({
                url: `/wallet/get-all/`,
                method: 'GET'
            }),
            providesTags: ()=> [{type: 'getAllWallet'}]
        }), 
        deleteSingleWallet: builder.mutation({
            query: (walletId) => ({
                url: `/wallet/delete`,
                method: 'DELETE', 
                body: walletId
            }),
            invalidatesTags: ()=> [{type: 'getAllWallet'}]
        }), 
    })
})
                                                                                                
export const {   
    useAddSingleWalletMutation,
    useGetAllWalletQuery,
    useDeleteSingleWalletMutation
} = walletApi;