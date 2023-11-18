import { apiSlice } from "../Api/ApiSlice";

export const currencyApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({ 
        addSingleCurrency: builder.mutation({
            query: (walletInfo) => ({
                url: `/currency/create`,
                method: 'POST', 
                body: walletInfo
            }),
            invalidatesTags: ()=> [{type: 'getAllCurrency'}]
        }), 
        getAllCurrency: builder.query({
            query: () => ({
                url: `/currency/get-all`,
                method: 'GET'
            }),
            providesTags: ()=> [{type: 'getAllCurrency'}]
        }), 
        getAllReferralIncome: builder.query({
            query: (userId) => ({
                url: `/currency/get-all-referral-income/${userId}`,
                method: 'GET'
            }),
            providesTags: ()=> [{type: 'getAllReferralIncome'}]
        }), 
        deleteSingleCurrency: builder.mutation({
            query: (walletId) => ({
                url: `/currency/delete`,
                method: 'DELETE', 
                body: walletId
            }),
            invalidatesTags: ()=> [{type: 'getAllCurrency'}]
        })
        
    })
})
                                                                                                
export const {   
    useAddSingleCurrencyMutation,
    useGetAllCurrencyQuery,
    useDeleteSingleCurrencyMutation,
    useGetAllReferralIncomeQuery
} = currencyApi;