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
export interface District {
  id: string;
  city_name: string;
  city_code: string;
  state_id: string;
}
export interface Area {
  id: string;
  place: string;
  zipcode: string;
  city_id: string;
  state_id: string;
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
  districts: District[];
  isLoadingDistricts: boolean;
  districtError: string | null;
  totalDistricts: number;
  areas: Area[];
  isLoadingAreas: boolean;
  areaError: string | null;
  totalAreas: number;
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
  districts: [],
  isLoadingDistricts: false,
  districtError: null,
  totalDistricts: 0,
  areas: [],
  isLoadingAreas: false,
  areaError: null,
  totalAreas: 0,
};

// Cancel token for managing concurrent requests
let cancelTokenSource: ReturnType<typeof axios.CancelToken.source> | null =
  null;
let stateCancelTokenSource: ReturnType<typeof axios.CancelToken.source> | null =
  null;
let districtCancelTokenSource: ReturnType<
  typeof axios.CancelToken.source
> | null = null;
let areaCancelTokenSource: ReturnType<typeof axios.CancelToken.source> | null =
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
    {
      countryId = "",
      search = "",
      limit = 20,
    }: { search?: string; countryId?: string; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      if (stateCancelTokenSource) {
        stateCancelTokenSource.cancel("Operation canceled due to new request.");
      }

      stateCancelTokenSource = axios.CancelToken.source();
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (search) {
        params.append("search", search);
      }
      const response = await axiosIns.get(
        `/api/locations/states/${countryId}?${params.toString()}`,
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

export const fetchDistricts = createAsyncThunk(
  "location/fetchDistricts",
  async (
    {
      countryId = "",
      stateId = "",
      search = "",
      limit = 20,
    }: { search?: string; countryId: string; stateId?: string; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      if (districtCancelTokenSource) {
        districtCancelTokenSource.cancel(
          "Operation canceled due to new request."
        );
      }

      districtCancelTokenSource = axios.CancelToken.source();
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (stateId) {
        params.append("state_id", stateId);
      }
      if (search) {
        params.append("search", search);
      }
      const response = await axiosIns.get(
        `/api/locations/cities/${countryId}?${params.toString()}`,
        {
          cancelToken: districtCancelTokenSource.token,
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

export const fetchAreas = createAsyncThunk(
  "location/fetchAreas",
  async (
    {
      countryId = "",
      stateId = "",
      cityId = "",
      search = "",
      limit = 20,
    }: {
      search?: string;
      countryId: string;
      stateId?: string;
      cityId?: string;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      if (areaCancelTokenSource) {
        areaCancelTokenSource.cancel("Operation canceled due to new request.");
      }

      areaCancelTokenSource = axios.CancelToken.source();
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (stateId) {
        params.append("state_id", stateId);
      }
      if (cityId) {
        params.append("city_id", cityId);
      }
      if (search) {
        params.append("search", search);
      }
      const response = await axiosIns.get(
        `/api/locations/areas/${countryId}?${params.toString()}`,
        {
          cancelToken: areaCancelTokenSource.token,
        }
      );

      return response.data.data;
    } catch (error) {
      if (axios.isCancel(error)) {
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
      state.states = [];
      state.totalStates = 0;
    },
    clearStateError: (state) => {
      state.stateError = null;
    },
    clearDistricts: (state) => {
      state.districts = [];
      state.totalDistricts = 0;
    },
    clearDistrictError: (state) => {
      state.districtError = null;
    },
    clearAreas: (state) => {
      state.areas = [];
      state.totalAreas = 0;
    },
    clearAreaError: (state) => {
      state.areaError = null;
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
        }
      })
      .addCase(fetchState.pending, (state) => {
        state.isLoadingStates = true;
        state.states = [];
        state.totalStates = 0;
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
        }
      })
      .addCase(fetchDistricts.pending, (state) => {
        state.isLoadingDistricts = true;
        state.districts = [];
        state.totalDistricts = 0;
        state.districtError = null;
      })
      .addCase(
        fetchDistricts.fulfilled,
        (state, action: PayloadAction<{ data: District[]; total: number }>) => {
          state.isLoadingDistricts = false;
          state.districts = action.payload.data;
          state.totalDistricts = action.payload.total;
        }
      )
      .addCase(fetchDistricts.rejected, (state, action) => {
        if (action.payload !== "cancelled") {
          state.isLoadingDistricts = false;
          state.districtError =
            action.error.message || "Failed to fetch districts";
        }
      })
      .addCase(fetchAreas.pending, (state) => {
        state.isLoadingAreas = true;
        state.areas = [];
        state.totalAreas = 0;
        state.areaError = null;
      })
      .addCase(
        fetchAreas.fulfilled,
        (state, action: PayloadAction<{ data: Area[]; total: number }>) => {
          state.isLoadingAreas = false;
          state.areas = action.payload.data;
          state.totalAreas = action.payload.total;
        }
      )
      .addCase(fetchAreas.rejected, (state, action) => {
        if (action.payload !== "cancelled") {
          state.isLoadingAreas = false;
          state.areaError = action.error.message || "Failed to fetch areas";
        }
      });
  },
});

export const {
  clearCountries,
  clearCountryError,
  clearStates,
  clearStateError,
  clearDistricts,
  clearDistrictError,
  clearAreas,
  clearAreaError,
} = locationSlice.actions;
export default locationSlice.reducer;
