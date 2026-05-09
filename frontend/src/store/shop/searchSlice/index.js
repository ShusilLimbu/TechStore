import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'


const initialState = {
    isLoading : false,
    searchResults : []
}

export const getSearchResults = createAsyncThunk('/search/getSearchResults', async(keyword)=>{
    const response = await axios.get(`/api/shop/search/${keyword}`);
    console.log(response, 'respuesta')
    return response.data;
})

const searchSlice = createSlice({
    name: 'searchSlice',
    initialState,
    reducers: {
        resetSearchResult: (state)=>{
            state.searchResults = [];
        }
    },
    extraReducers: (builder)=>{
        builder.addCase(getSearchResults.pending, (state)=>{
            state.isLoading = true;
        })
        .addCase(getSearchResults.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.searchResults = action.payload.data;
        }).addCase(getSearchResults.rejected, (state)=>{
            state.isLoading = false,
            state.searchResults = [];
        })
    }
})

export const { resetSearchResult } = searchSlice.actions;

export default searchSlice.reducer;