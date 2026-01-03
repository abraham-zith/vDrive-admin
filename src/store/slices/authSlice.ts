import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axiosIns from "../../api/axios";
import type { Login } from "../../login/Login";

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem("accessToken"),
  loading: false,
  error: null,
  accessToken: localStorage.getItem("accessToken"),
};

// Async thunk for login
export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: Login, { rejectWithValue }) => {
    try {
      const response = await axiosIns.post("/api/auth/signIn", {
        user_name: credentials.userName,
        password: credentials.password,
      });

      const token = response.data.data.accessToken;

      if (!token) {
        throw new Error("Authentication failed: token not found.");
      }

      localStorage.setItem("accessToken", token);
      return { accessToken: token };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Login failed",
      );
    }
  },
);

// Async thunk for logout
export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosIns.post("/api/auth/signout");

      if (data?.success) {
        localStorage.removeItem("accessToken");
        return;
      }

      throw new Error("Logout failed");
    } catch (error: any) {
      // Even if logout fails on server, remove local token
      localStorage.removeItem("accessToken");
      return rejectWithValue(
        error.response?.data?.message || error.message || "Logout failed",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
      if (action.payload) {
        localStorage.setItem("accessToken", action.payload);
        state.isAuthenticated = true;
      } else {
        localStorage.removeItem("accessToken");
        state.isAuthenticated = false;
      }
    },
    clearCountryError: (state) => {
      state.error = null;
    },
    checkAuthStatus: (state) => {
      const token = localStorage.getItem("accessToken");
      state.isAuthenticated = !!token;
      state.accessToken = token;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.error = action.payload as string;
      });
  },
});

export const {
  setAuthenticated,
  setAccessToken,
  clearCountryError,
  checkAuthStatus,
} = authSlice.actions;
export default authSlice.reducer;
