import { apiSlice } from "../Api/ApiSlice";

export const uploadApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        uploadSingleImage: builder.mutation({
            query: (data) => ({
                url: '/upload/single',
                method: 'POST',
                body: data,
                headers: {
                    "Content-Type": 'multipart/form-data'
                }
            })
        }),
        uploadMultipleImage: builder.mutation({
            query: (data) => ({
                url: '/upload/multiple',
                method: 'POST',
                body: data,
                headers: {
                    "Content-Type": 'multipart/form-data'
                }
            })
        }),
        deleteSingleImage: builder.mutation({
            query: (data) => ({
                url: '/upload/single',
                method: 'POST',
                body: data,
                headers: {
                    "Content-Type": 'multipart/form-data'
                }
            })
        }),
        deleteSingleImage: builder.mutation({
            query: (data) => ({
                url: '/upload/single',
                method: 'POST',
                body: data,
                formData: true,
            })
        }),
    })
})

export const { 
    useUploadSingleImageMutation
} = uploadApi;