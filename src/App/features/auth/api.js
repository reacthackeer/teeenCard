import { apiSlice } from "../Api/ApiSlice";

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (data) => ({
                url: '/auth/register',
                method: 'POST',
                body: data
            })
        }),
        addBackupPassword: builder.mutation({
            query: (data) => ({
                url: '/backup-password/add',
                method: 'POST',
                body: data
            })
        }),
        changePassword: builder.mutation({
            query: (data) => ({
                url: '/backup-password/change-password',
                method: 'POST',
                body: data
            })
        }),
        loginUser: builder.mutation({
            query: (data) => ({
                url: '/auth/login',
                method: 'POST',
                body: data
            })
        }),
        updateDesignation: builder.mutation({
            query: (data) => ({
                url: '/auth/admin/designation',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ()=> [{type: 'getAllUser'},{type: 'getAllAdmin'}]
        }),
        updateUser: builder.mutation({
            query: (data) => ({
                url: '/user/update',
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ()=> [{type: 'getAllUser'},{type: 'getAllAdmin'}]
        }),
        reEnterUser: builder.mutation({ 
            query: (data) => ({
                url: '/auth/re-enter',
                method: "POST",
                body: data
            })
        }),
        getAllAdmin: builder.query({
            query: () => ({
                url: `/auth/get-all-admin`,
                method: 'GET'
            }),
            providesTags: ()=> [{type: 'getAllAdmin'}]
        }), 
        getAllUser: builder.query({
            query: () => ({
                url: `/auth/get-all-user`,
                method: 'GET'
            }),
            providesTags: ()=> [{type: 'getAllUser'}]
        }), 
        deleteSingleUser: builder.mutation({
            query: (walletId) => ({
                url: `/auth/delete`,
                method: 'DELETE', 
                body: walletId
            }),
            invalidatesTags: ()=> [{type: 'getAllUser'},{type: 'getAllAdmin'}]
        }),
        activeSingleAccount: builder.mutation({
            query: (walletId) => ({
                url: `/auth/active`,
                method: 'PUT', 
                body: walletId
            }),
            invalidatesTags: ()=> [{type: 'getAllUser'},{type: 'getAllAdmin'}]
        }),
        disabledSingleAccount: builder.mutation({
            query: (walletId) => ({
                url: `/auth/disabled`,
                method: 'PUT', 
                body: walletId
            }),
            invalidatesTags: ()=> [{type: 'getAllUser'},{type: 'getAllAdmin'}]
        }),
        toggleInvitation: builder.mutation({
            query: (data) => ({
                url: '/auth/toggle-invitation',
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ()=> [{type: 'getAllUser'},{type: 'getAllAdmin'}]
        }),
        balanceTransfer: builder.mutation({
            query: (data) => ({
                url: '/auth/balance-transfer',
                method: 'PUT',
                body: data
            })
        }),
        referralBalanceTransfer: builder.mutation({
            query: (data) => ({
                url: '/auth/referral-balance-transfer',
                method: 'PUT',
                body: data
            })
        }),
        resetConnection: builder.mutation({
            query: (userId) => ({
                url: `/auth/reset-connection/${userId}`,
                method: 'PUT', 
            })
        }),
    })
})

export const {
    useReferralBalanceTransferMutation,
    useToggleInvitationMutation,
    useLoginUserMutation,
    useRegisterUserMutation,
    useUpdateUserMutation, 
    useReEnterUserMutation,
    useUpdateDesignationMutation,
    useGetAllAdminQuery,
    useGetAllUserQuery,
    useDeleteSingleUserMutation,
    useActiveSingleAccountMutation,
    useDisabledSingleAccountMutation,
    useAddBackupPasswordMutation,
    useChangePasswordMutation,
    useBalanceTransferMutation,
    useResetConnectionMutation
} = authApi;