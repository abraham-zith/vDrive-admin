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

    tripType: string;
    schedule: string;

    pickup: string;
    drop: string;
    distance: string;
    duration: string;

    fare: number;
    baseFare?: number;
    discount?: number;

    status: string;
    flags?: string[];

    zone?: string;
    createdAt?: string;
    scheduledFor?: string;

    createdBy?: string;
    lastUpdatedBy?: string;

    customerRating?: number;
    driverRating?: number;

    sentToCustomer?: boolean;
    sentToDriver?: boolean;
    sentToAdmin?: boolean;
}

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

            tripType: "One Way",
            schedule: "Immediate",

            pickup: "Chennai Airport",
            drop: "T Nagar",
            distance: "12 km",
            duration: "30 mins",

            fare: 450,
            baseFare: 400,
            discount: 50,

            status: "Completed",
            flags: ["priority"],

            createdAt: "2024-10-15T10:30:00Z",
            zone: "South",

            customerRating: 4.5,
            driverRating: 4.8,

            sentToCustomer: true,
            sentToDriver: true,
            sentToAdmin: false,
        },
        {
            tripId: "T1002",
            customerName: "Suresh",
            customerPhone: "9000000000",

            driverName: "Vijay",
            driverPhone: "8888888888",
            carNumber: "TN15XY6789",
            carType: "SUV",

            tripType: "Round Trip",
            schedule: "Scheduled",

            pickup: "Tambaram",
            drop: "Mahabalipuram",
            distance: "45 km",
            duration: "1 hr 10 mins",

            fare: 1200,
            status: "Ongoing",

            createdAt: "2024-10-16T12:00:00Z",
        },
        {
            tripId: "T1003",
            customerName: "Priya",
            customerPhone: "9789123456",
            driverName: "Manikandan",
            driverPhone: "9003201234",
            carNumber: "TN09BC2234",
            carType: "Mini",
            tripType: "One Way",
            schedule: "Immediate",
            pickup: "Velachery",
            drop: "OMR Navalur",
            distance: "9 km",
            duration: "22 mins",
            fare: 230,
            status: "Completed",
            zone: "South",
        },
        {
            tripId: "T1004",
            customerName: "Bala",
            customerPhone: "9898989898",
            driverName: "Senthil",
            driverPhone: "9090909090",
            carNumber: "TN11CD8899",
            carType: "Sedan",
            tripType: "Outstation",
            schedule: "Scheduled",
            pickup: "Chennai Central",
            drop: "Tirupati",
            distance: "133 km",
            duration: "3 hr 10 mins",
            fare: 3200,
            status: "In Progress",
            zone: "North",
        },
        {
            tripId: "T1005",
            customerName: "Divya",
            customerPhone: "9001122334",
            driverName: "Sathish",
            driverPhone: "9099112233",
            carNumber: "TN13EF1122",
            carType: "SUV",
            tripType: "Round Trip",
            schedule: "Advance",
            pickup: "Guindy",
            drop: "Pondicherry",
            distance: "165 km",
            duration: "3 hr 40 mins",
            fare: 4500,
            status: "Pending",
        },
        {
            tripId: "T1006",
            customerName: "Karthik",
            customerPhone: "9123456780",
            driverName: "Arun",
            driverPhone: "9898123456",
            carNumber: "TN19XY4500",
            carType: "Sedan",
            tripType: "One Way",
            schedule: "Immediate",
            pickup: "Thiruvanmiyur",
            drop: "Kodambakkam",
            distance: "14 km",
            duration: "35 mins",
            fare: 330,
            status: "Completed",
        },
        {
            tripId: "T1007",
            customerName: "Samantha",
            customerPhone: "9345612345",
            driverName: "Ravi",
            driverPhone: "9786543210",
            carNumber: "TN22ZZ1200",
            carType: "Hatchback",
            tripType: "One Way",
            schedule: "Immediate",
            pickup: "Nungambakkam",
            drop: "Mylapore",
            distance: "6 km",
            duration: "15 mins",
            fare: 180,
            status: "Completed",
        },
        {
            tripId: "T1008",
            customerName: "Ashwin",
            customerPhone: "9012345677",
            driverName: "Prakash",
            driverPhone: "9090011223",
            carNumber: "TN01GH9900",
            carType: "Mini",
            tripType: "One Way",
            schedule: "Advance",
            pickup: "Adyar",
            drop: "T Nagar",
            distance: "10 km",
            duration: "26 mins",
            fare: 260,
            status: "Pending",
        },
        {
            tripId: "T1009",
            customerName: "Harini",
            customerPhone: "9876001122",
            driverName: "Kannan",
            driverPhone: "9876778899",
            carNumber: "TN20JK5600",
            carType: "SUV",
            tripType: "Outstation",
            schedule: "Immediate",
            pickup: "Chennai",
            drop: "Vellore",
            distance: "140 km",
            duration: "2 hr 50 mins",
            fare: 3500,
            status: "Assigned",
        },
        {
            tripId: "T1010",
            customerName: "Vignesh",
            customerPhone: "9000900090",
            driverName: "None",
            driverPhone: "",
            carNumber: "",
            carType: "",
            tripType: "One Way",
            schedule: "Immediate",
            pickup: "Pallavaram",
            drop: "Chromepet",
            distance: "5 km",
            duration: "12 mins",
            fare: 120,
            status: "No Driver",
        },
        {
            tripId: "T1011",
            customerName: "Gowri",
            customerPhone: "9888877776",
            driverName: "Murugan",
            driverPhone: "9443322110",
            carNumber: "TN03AA2020",
            carType: "Sedan",
            tripType: "Round Trip",
            schedule: "Recurring",
            pickup: "Koyambedu",
            drop: "DLF Porur",
            distance: "11 km",
            duration: "28 mins",
            fare: 300,
            status: "Completed",
        },
        {
            tripId: "T1012",
            customerName: "Sakthi",
            customerPhone: "9323232323",
            driverName: "Ramesh",
            driverPhone: "9898981212",
            carNumber: "TN07CC7788",
            carType: "Hatchback",
            tripType: "One Way",
            schedule: "Immediate",
            pickup: "Ashok Nagar",
            drop: "KK Nagar",
            distance: "4 km",
            duration: "10 mins",
            fare: 100,
            status: "Completed",
        },
        {
            tripId: "T1013",
            customerName: "Meena",
            customerPhone: "9334567890",
            driverName: "Vikram",
            driverPhone: "9555512345",
            carNumber: "TN28DD0101",
            carType: "Sedan",
            tripType: "One Way",
            schedule: "Advance",
            pickup: "Velachery",
            drop: "Airport",
            distance: "8 km",
            duration: "20 mins",
            fare: 220,
            status: "Pending",
        },
        {
            tripId: "T1014",
            customerName: "John",
            customerPhone: "9445567890",
            driverName: "Hari",
            driverPhone: "9444456789",
            carNumber: "TN18EF7865",
            carType: "SUV",
            tripType: "Outstation",
            schedule: "Immediate",
            pickup: "Chennai",
            drop: "Salem",
            distance: "330 km",
            duration: "6 hr 30 mins",
            fare: 5800,
            status: "Completed",
        },
        {
            tripId: "T1015",
            customerName: "Aravind",
            customerPhone: "9998877665",
            driverName: "Surya",
            driverPhone: "8888990099",
            carNumber: "TN90PP3344",
            carType: "Mini",
            tripType: "One Way",
            schedule: "Immediate",
            pickup: "Anna Nagar",
            drop: "Perambur",
            distance: "12 km",
            duration: "25 mins",
            fare: 250,
            status: "In Progress",
        },
        {
            tripId: "T1016",
            customerName: "Rithika",
            customerPhone: "9556677889",
            driverName: "Gopal",
            driverPhone: "9345567788",
            carNumber: "TN05TR9988",
            carType: "Sedan",
            tripType: "Round Trip",
            schedule: "Scheduled",
            pickup: "Sholinganallur",
            drop: "Thiruvanmiyur",
            distance: "14 km",
            duration: "35 mins",
            fare: 300,
            status: "Ongoing",
        },
        {
            tripId: "T1017",
            customerName: "Deepak",
            customerPhone: "9443322123",
            driverName: "Mohan",
            driverPhone: "9555512341",
            carNumber: "TN77UY1122",
            carType: "Hatchback",
            tripType: "One Way",
            schedule: "Immediate",
            pickup: "Adayar",
            drop: "Teynampet",
            distance: "5 km",
            duration: "15 mins",
            fare: 150,
            status: "Cancelled",
        },
        {
            tripId: "T1018",
            customerName: "Ram",
            customerPhone: "9000080008",
            driverName: "Praveen",
            driverPhone: "9888811223",
            carNumber: "TN14AS9009",
            carType: "SUV",
            tripType: "Outstation",
            schedule: "Advance",
            pickup: "Chennai",
            drop: "Madurai",
            distance: "452 km",
            duration: "8 hr 10 mins",
            fare: 7500,
            status: "Pending",
        },
        {
            tripId: "T1019",
            customerName: "Swetha",
            customerPhone: "9345678901",
            driverName: "Raja",
            driverPhone: "9345678902",
            carNumber: "TN33TT8899",
            carType: "Sedan",
            tripType: "One Way",
            schedule: "Immediate",
            pickup: "Kodambakkam",
            drop: "Porur",
            distance: "8 km",
            duration: "18 mins",
            fare: 200,
            status: "Completed",
        },
        {
            tripId: "T1020",
            customerName: "Keerthi",
            customerPhone: "9666677776",
            driverName: "Arul",
            driverPhone: "9888997766",
            carNumber: "TN44GH9022",
            carType: "Mini",
            tripType: "One Way",
            schedule: "Scheduled",
            pickup: "Villivakkam",
            drop: "Koyambedu",
            distance: "7 km",
            duration: "15 mins",
            fare: 160,
            status: "Pending",
        },
        {
            tripId: "T1021",
            customerName: "Vasanth",
            customerPhone: "9003211122",
            driverName: "Shyam",
            driverPhone: "9555123400",
            carNumber: "TN12KL3344",
            carType: "SUV",
            tripType: "Outstation",
            schedule: "Immediate",
            pickup: "Chennai",
            drop: "Trichy",
            distance: "330 km",
            duration: "6 hr",
            fare: 5600,
            status: "Completed",
        },
        {
            tripId: "T1022",
            customerName: "Latha",
            customerPhone: "9345012345",
            driverName: "Saravanan",
            driverPhone: "9009008800",
            carNumber: "TN21QQ9022",
            carType: "Sedan",
            tripType: "One Way",
            schedule: "Immediate",
            pickup: "T Nagar",
            drop: "Saidapet",
            distance: "3 km",
            duration: "8 mins",
            fare: 100,
            status: "Completed",
        },
        {
            tripId: "T1023",
            customerName: "Kishore",
            customerPhone: "9455523345",
            driverName: "Gowtham",
            driverPhone: "9123412345",
            carNumber: "TN50WA1234",
            carType: "Hatchback",
            tripType: "Round Trip",
            schedule: "Scheduled",
            pickup: "Medavakkam",
            drop: "Sholinganallur",
            distance: "6 km",
            duration: "15 mins",
            fare: 180,
            status: "In Progress",
        },
        {
            tripId: "T1024",
            customerName: "Monica",
            customerPhone: "9888877123",
            driverName: "Yogesh",
            driverPhone: "9888001123",
            carNumber: "TN47HU3001",
            carType: "SUV",
            tripType: "Outstation",
            schedule: "Advance",
            pickup: "Chennai",
            drop: "Coimbatore",
            distance: "500 km",
            duration: "8 hr 45 mins",
            fare: 8200,
            status: "Ongoing",
        },
        {
            tripId: "T1025",
            customerName: "Dinesh",
            customerPhone: "9442244221",
            driverName: "Santhosh",
            driverPhone: "8111122334",
            carNumber: "TN35DD7788",
            carType: "Mini",
            tripType: "One Way",
            schedule: "Immediate",
            pickup: "Perungudi",
            drop: "Adyar",
            distance: "5 km",
            duration: "12 mins",
            fare: 140,
            status: "Completed",
        },
        {
            tripId: "T1026",
            customerName: "Naveen",
            customerPhone: "9000099000",
            driverName: "None",
            driverPhone: "",
            carNumber: "",
            carType: "",
            tripType: "One Way",
            schedule: "Immediate",
            pickup: "Red Hills",
            drop: "Padi",
            distance: "19 km",
            duration: "40 mins",
            fare: 350,
            status: "No Driver",
        },
        {
            tripId: "T1027",
            customerName: "Shruthi",
            customerPhone: "9333399992",
            driverName: "Raghu",
            driverPhone: "9888776655",
            carNumber: "TN56ZZ1122",
            carType: "Sedan",
            tripType: "Round Trip",
            schedule: "Recurring",
            pickup: "Adambakkam",
            drop: "Guindy",
            distance: "7 km",
            duration: "18 mins",
            fare: 180,
            status: "Completed",
        },
        {
            tripId: "T1028",
            customerName: "Farhan",
            customerPhone: "9555512342",
            driverName: "Abdul",
            driverPhone: "9000090011",
            carNumber: "TN67LO9800",
            carType: "SUV",
            tripType: "Outstation",
            schedule: "Immediate",
            pickup: "Chennai",
            drop: "Bangalore",
            distance: "350 km",
            duration: "6 hr 45 mins",
            fare: 6800,
            status: "Completed",
        },
        {
            tripId: "T1029",
            customerName: "Raja",
            customerPhone: "9444412345",
            driverName: "Prabhu",
            driverPhone: "9555511990",
            carNumber: "TN24XX9900",
            carType: "Mini",
            tripType: "One Way",
            schedule: "Immediate",
            pickup: "Teynampet",
            drop: "Nandanam",
            distance: "3 km",
            duration: "7 mins",
            fare: 110,
            status: "Completed",
        },
        {
            tripId: "T1030",
            customerName: "Anitha",
            customerPhone: "9334456789",
            driverName: "Suriya",
            driverPhone: "9888881111",
            carNumber: "TN71YU5522",
            carType: "Sedan",
            tripType: "Scheduled",
            schedule: "Advance",
            pickup: "Choolaimedu",
            drop: "Anna Nagar",
            distance: "8 km",
            duration: "20 mins",
            fare: 220,
            status: "Pending",
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