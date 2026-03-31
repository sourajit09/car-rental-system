import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/API.jsx';

// get all cars
export const getAllCars = createAsyncThunk(
  'car/getAllCars',
  async (filters = {}, thunkAPI) => {
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.returnDate) params.returnDate = filters.returnDate;

      const response = await API.get('/car/get-allcars', { params });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'error in get car from redux';

      return thunkAPI.rejectWithValue(message);
    }
  }
);

const carSlice = createSlice({
  name: 'car',
  initialState: {
    loading: false,
    success: false,
    cars: [],
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(getAllCars.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllCars.fulfilled, (state, action) => {
        state.loading = false;
        state.cars = action.payload.cars;
        state.success = true;
        state.error = null;
      })
      .addCase(getAllCars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export default carSlice.reducer;
