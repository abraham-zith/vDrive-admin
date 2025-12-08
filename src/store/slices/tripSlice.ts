import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosIns from "../../api/axios";

export interface TripDetailsType {
    tripId: string;
    customerName: string;
    customerPhone: string;
    driverName: string;
    driverPhone: string;
    carNumber: string;
    carType: string;

    pickup: string;
    drop: string;
    distance: string;
    duration: string;

    createdAt: string;
    paymentMethod: "Cash" | "UPI" | "Card" | "Wallet";

    // Fare Breakdown
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surge: number;
    toll: number;
    discount: number;
    tax: number;        // GST 5%
    fare: number;       // Total fare customer paid

    // Driver Side
    platformFee: number;
    taxDeduction: number;
    payout: number;

    status: "Completed" | "Cancelled" | "No Driver";
};


interface TripState {
    trips: TripDetailsType[];
    loading: boolean;
    error: string | null;
}

const initialState: TripState = {
    trips: [
        {
            tripId: "T1001",
            customerName: "Arun Kumar",
            customerPhone: "9876543210",

            driverName: "Ramesh",
            driverPhone: "9876501234",
            carNumber: "TN10AB1234",
            carType: "Sedan",

            pickup: "Chennai Airport",
            drop: "T Nagar",
            distance: "12 km",
            duration: "30 mins",

            createdAt: "2024-10-15T10:30:00Z",
            paymentMethod: "UPI",

            baseFare: 120,
            distanceFare: 240,
            timeFare: 60,
            surge: 25,
            toll: 0,
            discount: 50,
            tax: 20,
            fare: 415,

            platformFee: 40,
            taxDeduction: 10,
            payout: 365,

            status: "Completed",
        },

        {
            tripId: "T1002",
            customerName: "Suresh",
            customerPhone: "9000000000",

            driverName: "Vijay",
            driverPhone: "8888888888",
            carNumber: "TN15XY6789",
            carType: "SUV",

            pickup: "Tambaram",
            drop: "Mahabalipuram",
            distance: "45 km",
            duration: "1 hr 10 mins",

            createdAt: "2024-10-16T12:00:00Z",
            paymentMethod: "Cash",

            baseFare: 200,
            distanceFare: 600,
            timeFare: 150,
            surge: 40,
            toll: 50,
            discount: 0,
            tax: 50,
            fare: 1090,

            platformFee: 80,
            taxDeduction: 20,
            payout: 990,

            status: "Completed",
        },

        {
            tripId: "T1003",
            customerName: "Priya",
            customerPhone: "9789123456",

            driverName: "Manikandan",
            driverPhone: "9003201234",
            carNumber: "TN09BC2234",
            carType: "Mini",

            pickup: "Velachery",
            drop: "OMR Navalur",
            distance: "9 km",
            duration: "22 mins",

            createdAt: "2024-10-17T09:45:00Z",
            paymentMethod: "Card",

            baseFare: 80,
            distanceFare: 120,
            timeFare: 40,
            surge: 0,
            toll: 0,
            discount: 20,
            tax: 12,
            fare: 232,

            platformFee: 20,
            taxDeduction: 6,
            payout: 206,

            status: "Completed",
        },

        {
            tripId: "T1004",
            customerName: "Bala",
            customerPhone: "9898989898",

            driverName: "Senthil",
            driverPhone: "9090909090",
            carNumber: "TN11CD8899",
            carType: "Sedan",

            pickup: "Chennai Central",
            drop: "Tirupati",
            distance: "133 km",
            duration: "3 hr 10 mins",

            createdAt: "2024-10-18T08:00:00Z",
            paymentMethod: "UPI",

            baseFare: 300,
            distanceFare: 1600,
            timeFare: 300,
            surge: 0,
            toll: 150,
            discount: 0,
            tax: 100,
            fare: 2450,

            platformFee: 200,
            taxDeduction: 50,
            payout: 2200,

            status: "Completed",
        },

        {
            tripId: "T1005",
            customerName: "Divya",
            customerPhone: "9001122334",

            driverName: "Sathish",
            driverPhone: "9099112233",
            carNumber: "TN13EF1122",
            carType: "SUV",

            pickup: "Guindy",
            drop: "Pondicherry",
            distance: "165 km",
            duration: "3 hr 40 mins",

            createdAt: "2024-10-19T14:00:00Z",
            paymentMethod: "Wallet",

            baseFare: 320,
            distanceFare: 2100,
            timeFare: 350,
            surge: 0,
            toll: 100,
            discount: 70,
            tax: 120,
            fare: 2900,

            platformFee: 240,
            taxDeduction: 60,
            payout: 2600,

            status: "Completed",
        }
    ],
    loading: false,
    error: null,
};

// Keep API logic (not used when testing UI)
export const fetchTrips = createAsyncThunk(
    "trips/fetchTrips",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosIns.get("/api/trips");
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || "Something went wrong");
        }
    }
);

const tripSlice = createSlice({
    name: "trips",
    initialState,
    reducers: {
        clearTrips: (state) => {
            state.trips = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTrips.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTrips.fulfilled, (state, action) => {
                state.loading = false;
                state.trips = action.payload;
            })
            .addCase(fetchTrips.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearTrips } = tripSlice.actions;
export default tripSlice.reducer;