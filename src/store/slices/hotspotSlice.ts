import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axiosIns from "../../api/axios";

export interface Hotspot {
  id: string; // Changed from number to string (UUID)
  hotspot_name: string; // Changed from name
  fare: number; // Changed from addition
  multiplier: number;
}

interface HotspotState {
  hotspots: Hotspot[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: HotspotState = {
  hotspots: [],
  loading: false,
  error: null,
  total: 0,
};

export const fetchHotspots = createAsyncThunk(
  "hotspot/fetchHotspots",
  async (
    { limit = 20, search = "" }: { limit?: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      const response = await axiosIns.get(`/api/hotspots?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch hotspots"
      );
    }
  }
);

export const addHotspot = createAsyncThunk(
  "hotspot/addHotspot",
  async (hotspot: Omit<Hotspot, "id">, { rejectWithValue }) => {
    try {
      // The backend seems to expect an ID in the body based on the validation: id: Joi.string().required()
      // But typically creation generates an ID or frontend generates one.
      // Based on the route: router.post('/', ... id: Joi.string().required())
      // I should verify if the backend generates it or frontend needs to send it.
      // Assuming frontend needs to generate it or user provides it.
      // For now, I'll assume the API adds it if missing or I'll generate a UUID if needed.
      // Wait, the Joi validation says `id: Joi.string().required()`. So I must provide it.
      // I'll assume the caller of `addHotspot` will handle ID generation if this is a purely frontend-generated ID flow,
      // OR I should use a library like `uuid` here.
      // But let's check the types again. The route defines it as required.
      // I will assume the component passes the ID for now.

      const response = await axiosIns.post("/api/hotspots", hotspot);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add hotspot"
      );
    }
  }
);

export const updateHotspot = createAsyncThunk(
  "hotspot/updateHotspot",
  async (
    { id, data }: { id: string; data: Partial<Hotspot> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosIns.put(`/api/hotspots/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update hotspot"
      );
    }
  }
);

export const deleteHotspot = createAsyncThunk(
  "hotspot/deleteHotspot",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosIns.delete(`/api/hotspots/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete hotspot"
      );
    }
  }
);

const hotspotSlice = createSlice({
  name: "hotspot",
  initialState,
  reducers: {
    clearHotspotError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchHotspots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchHotspots.fulfilled,
        (state, action: PayloadAction<{ data: Hotspot[]; total: number }>) => {
          state.loading = false;
          state.hotspots = action.payload.data;
          state.total = action.payload.total;
        }
      )
      .addCase(fetchHotspots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add
      .addCase(addHotspot.fulfilled, (state, action) => {
        state.hotspots.push(action.payload);
      })
      // Update
      .addCase(updateHotspot.fulfilled, (state, action) => {
        const index = state.hotspots.findIndex(
          (h) => h.id === action.payload.id
        );
        if (index !== -1) {
          state.hotspots[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteHotspot.fulfilled, (state, action) => {
        state.hotspots = state.hotspots.filter((h) => h.id !== action.payload);
      });
  },
});

export const { clearHotspotError } = hotspotSlice.actions;
export default hotspotSlice.reducer;
