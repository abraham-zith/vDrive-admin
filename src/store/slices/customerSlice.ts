import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosIns from "../../api/axios";
import type { Customer } from "../../pages/Customers";

// ─── State ────────────────────────────────────────────────────────────────────
interface CustomerState {
    customers: Customer[];
    selectedCustomer: Customer | null;
    loading: boolean;
    actionLoading: boolean;
    error: string | null;
}

const initialState: CustomerState = {
    customers: [],
    selectedCustomer: null,
    loading: false,
    actionLoading: false,
    error: null,
};

// ─── Helper: fetch a single customer by id after an action ───────────────────
// This ensures we always sync the latest data from the server,
// regardless of what shape the action response returns.
const refetchCustomer = async (id: string): Promise<Customer> => {
    const response = await axiosIns.get(`/api/users/${id}`);
    console.log("refetchCustomer raw response:", response.data); // 👈 add this
    return response.data?.data
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchCustomers = createAsyncThunk(
    "customers/fetchCustomers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosIns.get("/api/users");
            console.log("fetchCustomers raw response:", response.data); // 👈 add this
            return response.data?.data || response.data?.users || response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch customers");
        }
    }
);

export const deleteCustomer = createAsyncThunk(
    "customers/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await axiosIns.delete(`/api/users/${id}`);
            return id; // just return id — no refetch needed since row is removed
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message ?? "Failed to delete customer");
        }
    }
);

export const blockCustomer = createAsyncThunk(
    "customers/block",
    async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
        try {
            await axiosIns.patch(`/api/users/block/${id}`, { reason });
            return await refetchCustomer(id); // ✅ always returns a full Customer object
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message ?? "Failed to block customer");
        }
    }
);

export const unblockCustomer = createAsyncThunk(
    "customers/unblock",
    async (id: string, { rejectWithValue }) => {
        try {
            await axiosIns.patch(`/api/users/unblock/${id}`);
            return await refetchCustomer(id); // ✅
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message ?? "Failed to unblock customer");
        }
    }
);

export const disableCustomer = createAsyncThunk(
    "customers/disable",
    async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
        try {
            const patch = await axiosIns.patch(`/api/users/suspend/${id}`, { reason });
            console.log("disable PATCH response:", patch.data); // 👈 add
            const customer = await refetchCustomer(id);
            console.log("disable refetch result:", customer);       // 👈 add
            return customer;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message ?? "Failed to disable customer");
        }
    }
);

export const enableCustomer = createAsyncThunk(
    "customers/enable",
    async (id: string, { rejectWithValue }) => {
        try {
            const patchRes = await axiosIns.patch(`/api/users/enable/${id}`);
            console.log("enable PATCH response:", patchRes.data); // 👈 add
            const customer = await refetchCustomer(id);
            console.log("enable refetch result:", customer);       // 👈 add
            return customer;

        } catch (error: any) {
            console.log("enable error:", error);
            return rejectWithValue(error.response?.data?.message ?? "Failed to enable customer");
        }
    }
);

// ─── Helper: sync updated customer into list + open drawer ────────────────────
// const syncCustomer = (state: CustomerState, updatedCustomer: Customer) => {
//     const index = state.customers.findIndex((c) => c.id === updatedCustomer.id);
//     if (index !== -1) state.customers[index] = updatedCustomer;
//     if (state.selectedCustomer?.id === updatedCustomer.id) {
//         state.selectedCustomer = updatedCustomer;
//     }
// };

// ─── Slice ────────────────────────────────────────────────────────────────────
const customerSlice = createSlice({
    name: "customers",
    initialState,
    reducers: {
        clearCustomers: (state) => {
            state.customers = [];
        },
        setSelectedCustomer: (state, action) => {
            state.selectedCustomer = action.payload;
        },
        clearSelectedCustomer: (state) => {
            state.selectedCustomer = null;
        },
    },
    extraReducers: (builder) => {

        // ── Fetch ───────────────────────────────────────────────────────────────
        builder
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.customers = action.payload;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // ── Delete ──────────────────────────────────────────────────────────────
        builder
            .addCase(deleteCustomer.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(deleteCustomer.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.customers = state.customers.filter((c) => c.id !== action.payload);
                if (state.selectedCustomer?.id === action.payload) {
                    state.selectedCustomer = null;
                }
            })
            .addCase(deleteCustomer.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload as string;
            });

        // ── Block ───────────────────────────────────────────────────────────────
        builder
            .addCase(blockCustomer.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(blockCustomer.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.customers = state.customers.map((c) =>
                    c.id === action.payload.id ? action.payload : c
                );
                // syncCustomer(state, action.payload);
            })
            .addCase(blockCustomer.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload as string;
            });

        // ── Unblock ─────────────────────────────────────────────────────────────
        builder
            .addCase(unblockCustomer.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(unblockCustomer.fulfilled, (state, action) => {
                state.actionLoading = false;
                // syncCustomer(state, action.payload);
                state.customers = state.customers.map((c) =>
                    c.id === action.payload.id ? action.payload : c
                );
            })
            .addCase(unblockCustomer.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload as string;
            });

        // ── Disable (Suspend) ───────────────────────────────────────────────────
        builder
            .addCase(disableCustomer.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(disableCustomer.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.customers = state.customers.map((c) =>
                    c.id === action.payload.id ? action.payload : c
                );
            })
            .addCase(disableCustomer.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload as string;
            });

        // ── Enable (Activate) ───────────────────────────────────────────────────
        builder
            .addCase(enableCustomer.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(enableCustomer.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.customers = state.customers.map((c) =>
                    c.id === action.payload.id ? action.payload : c
                );
            })
            .addCase(enableCustomer.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCustomers, setSelectedCustomer, clearSelectedCustomer } = customerSlice.actions;
export default customerSlice.reducer;