import { apiSlice } from "../Api/ApiSlice";

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        addCoupon: builder.mutation({
            query: (data) => ({
                url: '/coupon/add',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ()=> [{type: 'getAllCoupon'}]
        }), 
        applyCoupon: builder.mutation({
            query: (data) => ({
                url: '/coupon/apply',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ()=> [{type: 'getAllCoupon'}]
        }), 
        getAllCoupon: builder.query({
            query: () => ({
                url: `/coupon/get-all`,
                method: 'GET'
            }),
            providesTags: ()=> [{type: 'getAllCoupon'}]
        }), 
        deleteSingleCoupon: builder.mutation({
            query: (walletId) => ({
                url: `/coupon/delete`,
                method: 'DELETE', 
                body: walletId
            }),
            invalidatesTags: ()=> [{type: 'getAllCoupon'}]
        })
    })
})

export const {
    useAddCouponMutation,
    useApplyCouponMutation,
    useDeleteSingleCouponMutation,
    useGetAllCouponQuery
} = authApi;