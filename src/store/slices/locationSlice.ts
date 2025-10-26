import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axiosIns from "../../api/axios";
import axios from "axios";

export interface Country {
  id: string;
  country_code: string;
  country_name: string;
  country_flag: string;
}
export interface State {
  id: string;
  state_code: string;
  state_name: string;
  country_id: string;
}

interface LocationState {
  countries: Country[];
  isLoadingCountries: boolean;
  countryError: string | null;
  totalCountries: number;
  states: State[];
  isLoadingStates: boolean;
  stateError: string | null;
  totalStates: number;
}

const initialState: LocationState = {
  countries: [],
  isLoadingCountries: false,
  countryError: null,
  totalCountries: 0,
  states: [],
  isLoadingStates: false,
  stateError: null,
  totalStates: 0,
};

// Cancel token for managing concurrent requests
let cancelTokenSource: ReturnType<typeof axios.CancelToken.source> | null =
  null;
let stateCancelTokenSource: ReturnType<typeof axios.CancelToken.source> | null =
  null;

// Async thunk to fetch countries with cancel token support
export const fetchCountries = createAsyncThunk(
  "location/fetchCountries",
  async (
    { limit = 20, search = "" }: { limit?: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      // Cancel previous request if it exists
      if (cancelTokenSource) {
        cancelTokenSource.cancel("Operation canceled due to new request.");
      }

      // Create new cancel token
      cancelTokenSource = axios.CancelToken.source();

      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (search) {
        params.append("search", search);
      }

      const response = await axiosIns.get(
        `/api/locations/countries?${params.toString()}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );

      return response.data.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        // Request was cancelled, don't treat as error
        return rejectWithValue("cancelled");
      }
      throw error;
    }
  }
);
export const fetchState = createAsyncThunk(
  "location/fetchState",
  async (
    { limit = 20, countryId = "" }: { limit?: number; countryId?: string },
    { rejectWithValue }
  ) => {
    try {
      if (stateCancelTokenSource) {
        stateCancelTokenSource.cancel("Operation canceled due to new request.");
      }

      stateCancelTokenSource = axios.CancelToken.source();

      const response = await axiosIns.get(
        `/api/locations/states/${countryId}`,
        {
          cancelToken: stateCancelTokenSource.token,
        }
      );

      return response.data.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        // Request was cancelled, don't treat as error
        return rejectWithValue("cancelled");
      }
      throw error;
    }
  }
);

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    clearCountries: (state) => {
      state.countries = [];
      state.totalCountries = 0;
    },
    clearCountryError: (state) => {
      state.countryError = null;
    },
    clearStates: (state) => {
      state.countries = [];
      state.totalCountries = 0;
    },
    clearStateError: (state) => {
      state.stateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.isLoadingCountries = true;
        state.countryError = null;
      })
      .addCase(
        fetchCountries.fulfilled,
        (state, action: PayloadAction<{ data: Country[]; total: number }>) => {
          state.isLoadingCountries = false;
          state.countries = action.payload.data;
          state.totalCountries = action.payload.total;
        }
      )
      .addCase(fetchCountries.rejected, (state, action) => {
        // Don't set error state for cancelled requests
        if (action.payload !== "cancelled") {
          state.isLoadingCountries = false;
          state.countryError =
            action.error.message || "Failed to fetch countries";
        } else {
          state.isLoadingCountries = false;
        }
      })
      .addCase(fetchState.pending, (state) => {
        state.isLoadingStates = true;
        state.stateError = null;
      })
      .addCase(
        fetchState.fulfilled,
        (state, action: PayloadAction<{ data: State[]; total: number }>) => {
          state.isLoadingStates = false;
          state.states = action.payload.data;
          state.totalStates = action.payload.total;
        }
      )
      .addCase(fetchState.rejected, (state, action) => {
        // Don't set error state for cancelled requests
        if (action.payload !== "cancelled") {
          state.isLoadingStates = false;
          state.stateError = action.error.message || "Failed to fetch states";
        } else {
          state.isLoadingStates = false;
        }
      });
  },
});

export const { clearCountries, clearCountryError } = locationSlice.actions;
export default locationSlice.reducer;
