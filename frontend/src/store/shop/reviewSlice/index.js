import axios from "axios";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = import.meta.env.VITE_API_BASE_URL;

const initialState = {
    isLoading : false,
    reviews : []
}

export const addReview = createAsyncThunk('/order/addReview', 
    async (formdata, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `/api/shop/review/add`,
                formdata,
                {
                    withCredentials: true
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: 'Failed to add review' }
            );
        }
    }
    // const response = await axios.post(`/api/shop/review/add`,formdata,{withCredentials:true});
    // return response.data;
)

export const getReviews = createAsyncThunk('/order/getReviews', async(id)=>{
    

    const response = await axios.get(`/api/shop/review/${id}`,{withCredentials:true})
    return response.data;
})


const reviewSlice = createSlice({
    name:'reviewSlice',
    initialState,
    reducers: {},
    extraReducers : (builder)=>{
        builder
        .addCase(addReview.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addReview.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addReview.rejected, (state) => {
                state.isLoading = false;
            })
            // Get reviews
            .addCase(getReviews.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getReviews.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reviews = action.payload.data;
            })
            .addCase(getReviews.rejected, (state) => {
                state.isLoading = false;
                state.reviews = [];
            });

        // .addCase(getReviews.pending, (state)=>{
        //     state.isLoading = true
        // })
        // .addCase(getReviews.fulfilled, (state,action)=>{
        //     state.isLoading = false,
        //     state.reviews = action.payload.data
        // })
        // .addCase(getReviews.rejected, (state)=>{
        //     state.isLoading = false,
        //     state.reviews = []
        // })
    }
})

export default reviewSlice.reducer;