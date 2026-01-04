import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosIns from "../../api/axios";

export interface Driver {
    fullName: string;
    id: string;
    phone: string;
}

export type DeductionStatus =
    | "Success"
    | "Failed"
    | "Pending"
    | "Initiated"
    | "Reversed";

export interface Deduction {
    id: string;
    driver: Driver;
    amount: string;
    trip: string;
    type: string;
    balanceBefore: string;
    balanceAfter: string;
    status: DeductionStatus;
    date: string;
    reference: string;
    performedBy: string;
}

interface DeductionState {
    deductions: Deduction[];
    loading: boolean;
    error: string | null;
    stats: {
        totalDeductions: string;
        totalCommission: string;
        manualAdjustments: string;
        totalRefunds: string;
        totalPenalties: string;
        netDeductionAmount: string;
    } | null;
}

const initialState: DeductionState = {
    deductions: [],
    loading: false,
    error: null,
    stats: null,
};

export const fetchDeductions = createAsyncThunk(
    "deductions/fetchDeductions",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosIns.get("/api/deductions");
            return response.data?.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Something went wrong");
        }
    }
);

export const createDeduction = createAsyncThunk(
    "deductions/createDeduction",
    async (payload: Partial<Deduction>, { rejectWithValue }) => {
        try {
            const response = await axiosIns.post("/api/deductions", payload);
            return response.data?.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to create deduction");
        }
    }
);

const deductionSlice = createSlice({
    name: "deductions",
    initialState,
    reducers: {
        clearDeductions: (state) => {
            state.deductions = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDeductions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDeductions.fulfilled, (state, action) => {
                state.loading = false;
                state.deductions = action.payload?.deductions || [];
                state.stats = action.payload?.stats || null;
            })
            .addCase(fetchDeductions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createDeduction.fulfilled, (state, action) => {
                if (action.payload) {
                    state.deductions.unshift(action.payload);
                }
            });
    },
});

export const { clearDeductions } = deductionSlice.actions;
export default deductionSlice.reducer;
