import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axiosIns from "../../api/axios";

export interface ReferralConfig {
  id: string;
  user_type: 'CUSTOMER' | 'DRIVER';
  referrer_reward: number;
  referrer_reward_type: 'PERCENTAGE' | 'FIXED';
  referee_reward: number;
  referee_reward_type: 'PERCENTAGE' | 'FIXED';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ReferralConfigPayload = Omit<ReferralConfig, "id" | "created_at" | "updated_at">;

interface ReferralState {
  configs: ReferralConfig[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ReferralState = {
  configs: [],
  isLoading: false,
  error: null,
};

export const fetchReferralConfigs = createAsyncThunk(
  "referral/fetchConfigs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosIns.get("/api/referrals");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch referral configs"
      );
    }
  }
);

export const addReferralConfig = createAsyncThunk(
  "referral/addConfig",
  async (payload: ReferralConfigPayload, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosIns.post("/api/referrals", payload);
      dispatch(fetchReferralConfigs());
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add referral config"
      );
    }
  }
);

export const updateReferralConfig = createAsyncThunk(
  "referral/updateConfig",
  async (
    { id, data }: { id: string; data: Partial<ReferralConfigPayload> },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await axiosIns.patch(`/api/referrals/${id}`, data);
      dispatch(fetchReferralConfigs());
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update referral config"
      );
    }
  }
);

export const deleteReferralConfig = createAsyncThunk(
  "referral/deleteConfig",
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      await axiosIns.delete(`/api/referrals/${id}`);
      dispatch(fetchReferralConfigs());
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete referral config"
      );
    }
  }
);

const referralSlice = createSlice({
  name: "referral",
  initialState,
  reducers: {
    clearReferralError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferralConfigs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReferralConfigs.fulfilled, (state, action: PayloadAction<ReferralConfig[]>) => {
        state.isLoading = false;
        state.configs = action.payload || [];
      })
      .addCase(fetchReferralConfigs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addReferralConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addReferralConfig.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addReferralConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateReferralConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReferralConfig.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateReferralConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearReferralError } = referralSlice.actions;
export default referralSlice.reducer;
