import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../api/axios";

// Types for the API response
interface Country {
  id: string;
  country_code: string;
  country_name: string;
  country_flag: string;
}

interface CountriesApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    data: Country[];
    total: number;
  };
  meta: {
    requestId: string;
    timestamp: string;
    service: string;
    version: string;
  };
  error: null | string;
}

interface PricingState {
  countries: Country[];
  totalCountries: number;
  loadedCountries: number;
  hasMore: boolean;
  countryLoading: boolean;
  countryError: string | null;
}

// Async thunk for fetching countries (initial load)
export const fetchCountries = createAsyncThunk(
  "pricing/fetchCountries",
  async ({ limit = 50, search }: { limit?: number; search?: string } = {}) => {
    const response = await api.get<CountriesApiResponse>(
      `/api/locations/countries`,
      { params: { limit, ...(search ? { search } : {}) } }
    );
    return response.data;
  }
);

// Async thunk for loading more countries
export const loadMoreCountries = createAsyncThunk(
  "pricing/loadMoreCountries",
  async ({ offset, limit = 50 }: { offset: number; limit?: number }) => {
    const response = await api.get<CountriesApiResponse>(
      `/api/locations/countries?page=${
        Math.ceil(offset / limit) + 1
      }&limit=${limit}`
    );
    return response.data;
  }
);

const initialState: PricingState = {
  countries: [],
  totalCountries: 0,
  loadedCountries: 0,
  hasMore: true,
  countryLoading: false,
  countryError: null,
};

const pricingSlice = createSlice({
  name: "pricing",
  initialState,
  reducers: {
    clearCountryError: (state) => {
      state.countryError = null;
    },
    resetCountries: (state) => {
      state.countries = [];
      state.totalCountries = 0;
      state.loadedCountries = 0;
      state.hasMore = true;
      state.countryError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Countries (initial load)
      .addCase(fetchCountries.pending, (state) => {
        state.countryLoading = true;
        state.countryError = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.countryLoading = false;
        state.countries = action.payload.data.data;
        state.totalCountries = action.payload.data.total;
        state.loadedCountries = action.payload.data.data.length;
        state.hasMore =
          action.payload.data.data.length < action.payload.data.total;
        state.countryError = null;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.countryLoading = false;
        state.countryError =
          action.error.message || "Failed to fetch countries";
        state.countries = [];
        state.loadedCountries = 0;
        state.hasMore = true;
      })
      // Load More Countries
      .addCase(loadMoreCountries.pending, (state) => {
        state.countryLoading = true;
        state.countryError = null;
      })
      .addCase(loadMoreCountries.fulfilled, (state, action) => {
        state.countryLoading = false;
        state.countries = [...state.countries, ...action.payload.data.data];
        state.loadedCountries += action.payload.data.data.length;
        state.hasMore = state.loadedCountries < action.payload.data.total;
        state.countryError = null;
      })
      .addCase(loadMoreCountries.rejected, (state, action) => {
        state.countryLoading = false;
        state.countryError =
          action.error.message || "Failed to load more countries";
      });
  },
});

export const { clearCountryError, resetCountries } = pricingSlice.actions;
export default pricingSlice.reducer;
