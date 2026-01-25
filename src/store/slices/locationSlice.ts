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
export interface City {
  id: string;
  city_name: string;
  state_id: string;
  country_id: string;
}

export interface Area {
  id: string;
  place: string;
  city_id: string;
  state_id: string;
  country_id: string;
  zipcode: string;
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
  cities: City[];
  isLoadingCities: boolean;
  cityError: string | null;
  totalCities: number;
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
  cities: [],
  isLoadingCities: false,
  cityError: null,
  totalCities: 0,
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
let cityCancelTokenSource: ReturnType<typeof axios.CancelToken.source> | null =
  null;
let areaCancelTokenSource: ReturnType<typeof axios.CancelToken.source> | null =
  null;

// Async thunk to fetch countries with cancel token support
export const fetchCountries = createAsyncThunk(
  "location/fetchCountries",
  async (
    { limit = 20, search = "" }: { limit?: number; search?: string },
    { rejectWithValue },
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
        },
      );

      return response.data.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        // Request was cancelled, don't treat as error
        return rejectWithValue("cancelled");
      }
      throw error;
    }
  },
);
export const fetchState = createAsyncThunk(
  "location/fetchState",
  async (
    {
      countryId = "",
      search = "",
      limit = 20,
    }: { search?: string; countryId?: string; limit?: number },
    { rejectWithValue },
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
        },
      );

      return response.data.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        // Request was cancelled, don't treat as error
        return rejectWithValue("cancelled");
      }
      throw error;
    }
  },
);

export const fetchCities = createAsyncThunk(
  "location/fetchCities",
  async (
    {
      countryId,
      stateId = null,
      search = "",
      limit = 20,
    }: {
      countryId: string;
      stateId?: string | null;
      search?: string;
      limit?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      if (cityCancelTokenSource) {
        cityCancelTokenSource.cancel("Operation canceled due to new request.");
      }
      cityCancelTokenSource = axios.CancelToken.source();

      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (stateId) params.append("state_id", stateId);

      const response = await axiosIns.get(
        `/api/locations/cities/${countryId}?${params.toString()}`,
        { cancelToken: cityCancelTokenSource.token },
      );
      return response.data.data;
    } catch (error) {
      if (axios.isCancel(error)) return rejectWithValue("cancelled");
      throw error;
    }
  },
);

export const fetchAreas = createAsyncThunk(
  "location/fetchAreas",
  async (
    {
      countryId,
      stateId = null,
      cityId = null,
      search = "",
      limit = 20,
    }: {
      countryId: string;
      stateId?: string | null;
      cityId?: string | null;
      search?: string;
      limit?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      if (areaCancelTokenSource) {
        areaCancelTokenSource.cancel("Operation canceled due to new request.");
      }
      areaCancelTokenSource = axios.CancelToken.source();

      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (stateId) params.append("state_id", stateId);
      if (cityId) params.append("city_id", cityId);

      const response = await axiosIns.get(
        `/api/locations/areas/${countryId}?${params.toString()}`,
        { cancelToken: areaCancelTokenSource.token },
      );
      return response.data.data;
    } catch (error) {
      if (axios.isCancel(error)) return rejectWithValue("cancelled");
      throw error;
    }
  },
);

export const createArea = createAsyncThunk(
  "location/createArea",
  async (
    data: {
      place: string;
      country_id: string;
      state_id?: string | null;
      city_id?: string | null;
      zipcode?: string | null;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosIns.post("/api/locations/areas", data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create area",
      );
    }
  },
);

export const fetchLocationByZipcode = createAsyncThunk(
  "location/fetchLocationByZipcode",
  async (zipcode: string, { rejectWithValue }) => {
    try {
      const response = await axiosIns.get(`/api/locations/zipcode/${zipcode}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return rejectWithValue("not_found");
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch location by zipcode",
      );
    }
  },
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
    clearCities: (state) => {
      state.cities = [];
      state.totalCities = 0;
    },
    clearCityError: (state) => {
      state.cityError = null;
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
        },
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
        },
      )
      .addCase(fetchState.rejected, (state, action) => {
        // Don't set error state for cancelled requests
        if (action.payload !== "cancelled") {
          state.isLoadingStates = false;
          state.stateError = action.error.message || "Failed to fetch states";
        } else {
          state.isLoadingStates = false;
        }
      })
      .addCase(fetchCities.pending, (state) => {
        state.isLoadingCities = true;
        state.cityError = null;
      })
      .addCase(
        fetchCities.fulfilled,
        (state, action: PayloadAction<{ data: City[]; total: number }>) => {
          state.isLoadingCities = false;
          state.cities = action.payload.data;
          state.totalCities = action.payload.total;
        },
      )
      .addCase(fetchCities.rejected, (state, action) => {
        if (action.payload !== "cancelled") {
          state.isLoadingCities = false;
          state.cityError = action.error.message || "Failed to fetch cities";
        }
      })
      .addCase(fetchAreas.pending, (state) => {
        state.isLoadingAreas = true;
        state.areaError = null;
      })
      .addCase(
        fetchAreas.fulfilled,
        (state, action: PayloadAction<{ data: Area[]; total: number }>) => {
          state.isLoadingAreas = false;
          state.areas = action.payload.data;
          state.totalAreas = action.payload.total;
        },
      )
      .addCase(fetchAreas.rejected, (state, action) => {
        if (action.payload !== "cancelled") {
          state.isLoadingAreas = false;
          state.areaError = action.error.message || "Failed to fetch areas";
        }
      })
      .addCase(createArea.fulfilled, (state, action: PayloadAction<Area>) => {
        // We could either append it or just let the search find it.
        // Appending it might be better for UX so it appears immediately if we want to select it.
        // However, LocationConfiguration will likely use the returned payload to set the value.
        state.areas.push(action.payload);
      })
      .addCase(fetchLocationByZipcode.pending, (state) => {
        // You might want to track loading state for autofill specifically if needed
      })
      .addCase(fetchLocationByZipcode.fulfilled, (state, action) => {
        // Data handling happens in the component usually for autofill, but we could update state here if needed
        // For now, the component unwraps the result and uses it directly.
      })
      .addCase(fetchLocationByZipcode.rejected, (state, action) => {
        // Error handling
      });
  },
});

export const {
  clearCountries,
  clearCountryError,
  clearStates,
  clearStateError,
  clearCities,
  clearCityError,
  clearAreas,
  clearAreaError,
} = locationSlice.actions;
export default locationSlice.reducer;
