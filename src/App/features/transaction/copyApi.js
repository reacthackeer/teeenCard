import { apiSlice } from "../Api/ApiSlice";

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSingleUserReferralIncome: builder.query({
            query: ({userId, page}) => ({
                url: `/transaction/referral-income/${userId}?page=${page}`,
                method: 'GET', 
            })
        }),
        getSingleUserTransaction: builder.query({
            query: ({userId, page}) => ({
                url: `/transaction/transaction-history/${userId}?page=${page}`,
                method: 'GET', 
            })
        })
    })
})

export const { 
    useGetSingleUserReferralIncomeQuery,
    useGetSingleUserTransactionQuery
} = authApi;