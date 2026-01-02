import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosIns from "../../api/axios";

export interface TripDetailsType {
  trip_id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  driver_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_id: string | null;
  car_number: string | null;
  car_type: string | null;

  ride_type: "ONE_WAY" | "ROUND_TRIP" | "DAILY" | "OUTSTATION";
  service_type: "DRIVER_ONLY" | "CAB+DRIVER";

  trip_status:
    | "LIVE"
    | "COMPLETED"
    | "CANCELLED"
    | "UPCOMING"
    | "REQUESTED"
    | "MID-CANCELLED";

  original_scheduled_start_time: string;
  scheduled_start_time: string;

  actual_pickup_time: string | null;
  actual_drop_time: string | null;

  pickup_lat: number;
  pickup_lng: number;
  pickup_address: string;

  drop_lat: number;
  drop_lng: number;
  drop_address: string;

  distance_km: number;
  trip_duration_minutes: number;
  waiting_time_minutes: number;

  Estimate_km: number;
  distance_fare_per_km: number;
  distance_fare: number;

  base_fare: number;
  time_fare_per_minute: number;
  time_fare: number;
  waiting_charges: number;
  driver_allowance: number;
  return_compensation: number;
  platform_fee: number;
  total_fare: number;
  surge_multiplier: number;
  surge_pricing: number;

  tip: number;
  toll_charges: number;
  night_charges: number;
  discount: number;
  gst_percentage: number;
  gst_amount: number;

  subtotal: number;
  paid_amount: number;
  payment_status: "PAID" | "PENDING" | "FAILED";
  payment_method: "UPI" | "CASH" | "CARD" | "WALLET";

  cancel_reason: string | null;
  cancel_by: "USER" | "DRIVER" | "ADMIN" | null;

  notes: string | null;

  created_at: string;
  updated_at: string;
  assigned_at: string | null;
  started_at: string | null;
  ended_at: string | null;

  trip_changes: {
    id: string;
    trip_id: string;

    change_type: "SCHEDULE_TIME" | "FARE" | "DRIVER" | "STATUS";

    old_value: Record<string, any>;
    new_value: Record<string, any>;

    changed_by: "USER" | "ADMIN" | "SYSTEM";
    changed_at: string;

    notes: string | null;
  }[];
}

interface TripState {
  trips: TripDetailsType[];
  loading: boolean;
  error: string | null;
}

const initialState: TripState = {
  trips: [
    {
      trip_id: "trip_124",
      user_id: "user_111aaa",
      user_name: "Arun",
      user_phone: "9876543210",

      driver_id: "driver_111bbb",
      driver_name: "Ramesh",
      driver_phone: "9123456789",

      vehicle_id: "vehicle_11",
      car_number: "TN01AB1234",
      car_type: "Sedan",

      ride_type: "ONE_WAY",
      service_type: "DRIVER_ONLY",
      trip_status: "COMPLETED",

      original_scheduled_start_time: "2025-12-15T09:00:00Z",
      scheduled_start_time: "2025-12-15T09:00:00Z",
      actual_pickup_time: "2025-12-15T09:05:00Z",
      actual_drop_time: "2025-12-15T10:10:00Z",

      pickup_lat: 13.0604,
      pickup_lng: 80.2496,
      pickup_address: "Koramangala 4th Block, 80 Feet Road, Bangalore - 560034",

      drop_lat: 13.0827,
      drop_lng: 80.2707,
      drop_address: "Whitefield Main Road, Near ITPL, Bangalore - 560066",

      Estimate_km: 13,
      distance_km: 14.2,
      trip_duration_minutes: 65,
      waiting_time_minutes: 0,

      /* ───────── Fare Breakdown ───────── */

      base_fare: 300,

      distance_fare_per_km: 13,
      distance_fare: 184.6, // 14.2 × 13

      time_fare_per_minute: 1.5,
      time_fare: 97.5,

      waiting_charges: 0,
      driver_allowance: 150,
      return_compensation: 0,

      surge_multiplier: 1.2,
      surge_pricing: 96,

      tip: 20,
      toll_charges: 35,
      night_charges: 0,

      discount: 50,

      subtotal: 833.1,

      gst_percentage: 5,
      gst_amount: 41.66,

      platform_fee: 80,

      total_fare: 954.76,
      paid_amount: 954.76,
      payment_status: "PAID",
      payment_method: "UPI",

      cancel_reason: null,
      cancel_by: null,
      notes: null,

      created_at: "2025-12-15T08:30:00Z",
      updated_at: "2025-12-15T10:10:00Z",
      assigned_at: "2025-12-15T08:50:00Z",
      started_at: "2025-12-15T09:05:00Z",
      ended_at: "2025-12-15T10:10:00Z",

      /* ───────── Trip Changes ───────── */

      trip_changes: [
        {
          id: "change_002",
          trip_id: "trip_124",
          change_type: "DRIVER",
          old_value: {
            driver_id: "driver_999xxx",
            driver_name: "Suresh",
          },
          new_value: {
            driver_id: "driver_111bbb",
            driver_name: "Ramesh",
          },
          changed_by: "USER",
          changed_at: "2025-12-15T08:45:00Z",
          notes: "Driver reassigned due to availability",
        },
        {
          id: "change_101",
          trip_id: "trip_125",
          change_type: "SCHEDULE_TIME",
          old_value: { scheduled_start_time: "2025-12-16T07:30:00Z" },
          new_value: { scheduled_start_time: "2025-12-16T07:45:00Z" },
          changed_by: "USER",
          changed_at: "2025-12-16T07:05:00Z",
          notes: "Pickup delayed by user",
        },
      ],
    },

    {
      trip_id: "trip_125",
      user_id: "user_222bbb",
      user_name: "Priya",
      user_phone: "9789123456",

      driver_id: "driver_222ccc",
      driver_name: "Manikandan",
      driver_phone: "9003201234",

      vehicle_id: "vehicle_10",
      car_number: "KA05MK4567",
      car_type: "Hatchback",
      ride_type: "ONE_WAY",
      service_type: "DRIVER_ONLY",
      trip_status: "COMPLETED",

      original_scheduled_start_time: "2025-12-16T07:30:00Z",
      scheduled_start_time: "2025-12-16T07:45:00Z",
      actual_pickup_time: "2025-12-16T07:50:00Z",
      actual_drop_time: "2025-12-16T08:35:00Z",

      pickup_lat: 12.9716,
      pickup_lng: 80.2211,
      pickup_address: "Velachery, Chennai",

      drop_lat: 12.99,
      drop_lng: 80.247,
      drop_address: "Adyar, Chennai",

      Estimate_km: 10,
      distance_km: 10.8,
      trip_duration_minutes: 45,
      waiting_time_minutes: 3,

      base_fare: 250,
      payment_method: "CARD",

      distance_fare_per_km: 13,
      distance_fare: 140.4,

      time_fare_per_minute: 1.2,
      time_fare: 54,

      waiting_charges: 0,
      driver_allowance: 120,
      return_compensation: 0,

      surge_multiplier: 1,
      surge_pricing: 0,

      tip: 0,
      toll_charges: 0,
      night_charges: 0,

      discount: 20,

      subtotal: 544.4,

      gst_percentage: 5,
      gst_amount: 27.22,

      platform_fee: 60,

      total_fare: 631.62,
      paid_amount: 631.62,
      payment_status: "PAID",

      cancel_reason: null,
      cancel_by: null,
      notes: null,

      created_at: "2025-12-16T07:10:00Z",
      updated_at: "2025-12-16T08:35:00Z",
      assigned_at: "2025-12-16T07:25:00Z",
      started_at: "2025-12-16T07:50:00Z",
      ended_at: "2025-12-16T08:35:00Z",

      trip_changes: [
        {
          id: "change_101",
          trip_id: "trip_125",
          change_type: "SCHEDULE_TIME",
          old_value: { scheduled_start_time: "2025-12-16T07:30:00Z" },
          new_value: { scheduled_start_time: "2025-12-16T07:45:00Z" },
          changed_by: "USER",
          changed_at: "2025-12-16T07:05:00Z",
          notes: "Pickup delayed by user",
        },
      ],
    },

    {
      trip_id: "trip_126",
      user_id: "user_333ccc",
      user_name: "Suresh",
      user_phone: "9000000000",

      driver_id: "driver_333ddd",
      driver_name: "Vijay",
      driver_phone: "8888888888",

      vehicle_id: "vehicle_09",
      car_number: "MH12XY7890",
      car_type: "SUV",

      ride_type: "ROUND_TRIP",
      service_type: "DRIVER_ONLY",
      trip_status: "COMPLETED",

      original_scheduled_start_time: "2025-12-17T05:00:00Z",
      scheduled_start_time: "2025-12-17T05:00:00Z",
      actual_pickup_time: "2025-12-17T05:05:00Z",
      actual_drop_time: "2025-12-17T08:30:00Z",

      pickup_lat: 13.0604,
      pickup_lng: 80.2496,
      pickup_address: "Guindy, Chennai",

      drop_lat: 12.9716,
      drop_lng: 77.5946,
      drop_address: "Bangalore",

      Estimate_km: 60,
      distance_km: 65,
      trip_duration_minutes: 205,
      waiting_time_minutes: 10,

      /* ───────── Fare Breakdown ───────── */

      base_fare: 400,

      distance_fare_per_km: 13,
      distance_fare: 845, // 65 × 13

      time_fare_per_minute: 2,
      time_fare: 410, // 205 × 2

      waiting_charges: 50,
      driver_allowance: 200,
      return_compensation: 100,
      payment_method: "UPI",

      surge_multiplier: 1.3,
      surge_pricing: 120, // 400 × (1.3 − 1)

      tip: 50,
      toll_charges: 120,
      night_charges: 0,

      discount: 0,

      subtotal: 2395,

      gst_percentage: 5,
      gst_amount: 119.75,

      platform_fee: 100,

      total_fare: 2614.75,
      paid_amount: 2614.75,
      payment_status: "PAID",

      cancel_reason: null,
      cancel_by: null,
      notes: null,

      created_at: "2025-12-17T04:30:00Z",
      updated_at: "2025-12-17T08:30:00Z",
      assigned_at: "2025-12-17T04:45:00Z",
      started_at: "2025-12-17T05:05:00Z",
      ended_at: "2025-12-17T08:30:00Z",

      trip_changes: [
        {
          id: "change_201",
          trip_id: "trip_126",
          change_type: "SCHEDULE_TIME",
          old_value: { scheduled_start_time: "2025-12-16T07:30:00Z" },
          new_value: { scheduled_start_time: "2025-12-16T07:45:00Z" },
          changed_by: "USER",
          changed_at: "2025-12-17T05:10:00Z",
          notes: "Pickup delayed by user",
        },
      ],
    },

    {
      trip_id: "trip_128",
      user_id: "user_555eee",
      user_name: "Karthik",
      user_phone: "9012345678",

      driver_id: "driver_555fff",
      driver_name: "Senthil",
      driver_phone: "9222222222",

      vehicle_id: "vehicle_08",
      car_number: "TS09EF6789",
      car_type: "Compact SUV",

      ride_type: "OUTSTATION",
      service_type: "CAB+DRIVER",
      trip_status: "COMPLETED",

      original_scheduled_start_time: "2025-12-19T03:30:00Z",
      scheduled_start_time: "2025-12-19T03:30:00Z",
      actual_pickup_time: "2025-12-19T03:40:00Z",
      actual_drop_time: "2025-12-19T08:10:00Z",

      pickup_lat: 13.0604,
      pickup_lng: 80.2496,
      pickup_address: "Guindy, Chennai",

      Estimate_km: 160,
      drop_lat: 11.0168,
      drop_lng: 76.9558,
      drop_address: "Coimbatore",

      distance_km: 165,
      trip_duration_minutes: 270,
      waiting_time_minutes: 15,

      base_fare: 500,

      distance_fare_per_km: 13,
      distance_fare: 2145,

      time_fare_per_minute: 2.5,
      time_fare: 675,

      waiting_charges: 100,
      driver_allowance: 300,
      return_compensation: 0,
      payment_method: "CASH",

      surge_multiplier: 1,
      surge_pricing: 0,

      tip: 100,
      toll_charges: 250,
      night_charges: 0,

      discount: 100,

      subtotal: 3970,

      gst_percentage: 5,
      gst_amount: 198.5,

      platform_fee: 200,

      total_fare: 4368.5,
      paid_amount: 4368.5,
      payment_status: "PAID",

      cancel_reason: null,
      cancel_by: null,
      notes: null,

      created_at: "2025-12-19T03:00:00Z",
      updated_at: "2025-12-19T08:10:00Z",
      assigned_at: "2025-12-19T03:10:00Z",
      started_at: "2025-12-19T03:40:00Z",
      ended_at: "2025-12-19T08:10:00Z",

      trip_changes: [
        {
          id: "change_401",
          trip_id: "trip_128",
          change_type: "DRIVER",
          old_value: { driver_name: "Ravi" },
          new_value: { driver_name: "Senthil" },
          changed_by: "USER",
          changed_at: "2025-12-19T03:20:00Z",
          notes: "Driver changed before pickup",
        },
      ],
    },

    {
      trip_id: "trip_129",
      user_id: "user_101aaa",
      user_name: "Arun",
      user_phone: "9000011111",

      driver_id: "driver_101bbb",
      driver_name: "Mani",
      driver_phone: "9333333333",

      vehicle_id: "vehicle_01",
      car_number: "TN22GH3456",
      car_type: "Mini",

      ride_type: "ONE_WAY",
      service_type: "CAB+DRIVER",
      trip_status: "COMPLETED",

      original_scheduled_start_time: "2025-12-18T05:00:00Z",
      scheduled_start_time: "2025-12-18T05:00:00Z",
      actual_pickup_time: "2025-12-18T05:05:00Z",
      actual_drop_time: "2025-12-18T06:00:00Z",

      pickup_lat: 13.0418,
      pickup_lng: 80.2341,
      pickup_address: "T Nagar, Chennai",

      drop_lat: 12.975,
      drop_lng: 80.22,
      drop_address: "Velachery, Chennai",

      Estimate_km: 15,
      distance_km: 18,
      trip_duration_minutes: 55,
      waiting_time_minutes: 5,

      base_fare: 150,

      distance_fare_per_km: 13,
      distance_fare: 234,

      time_fare_per_minute: 2.5,
      time_fare: 138,
      payment_method: "UPI",

      waiting_charges: 20,
      driver_allowance: 0,
      return_compensation: 0,

      surge_multiplier: 1,
      surge_pricing: 0,

      tip: 50,
      toll_charges: 0,
      night_charges: 0,

      discount: 0,

      subtotal: 592,

      gst_percentage: 5,
      gst_amount: 29.6,

      platform_fee: 50,

      total_fare: 671.6,
      paid_amount: 671.6,
      payment_status: "PAID",

      cancel_reason: null,
      cancel_by: null,
      notes: null,

      created_at: "2025-12-18T04:50:00Z",
      updated_at: "2025-12-18T06:00:00Z",
      assigned_at: "2025-12-18T04:55:00Z",
      started_at: "2025-12-18T05:05:00Z",
      ended_at: "2025-12-18T06:00:00Z",

      trip_changes: [],
    },
    {
      trip_id: "trip_130",
      user_id: "user_202bbb",
      user_name: "Priya",
      user_phone: "9000022222",

      driver_id: null,
      driver_name: null,
      driver_phone: null,

      vehicle_id: "vehicle_07",
      car_number: "KL07JK9012",
      car_type: "MPV",

      ride_type: "ROUND_TRIP",
      service_type: "CAB+DRIVER",
      trip_status: "LIVE",

      original_scheduled_start_time: "2025-12-19T02:30:00Z",
      scheduled_start_time: "2025-12-19T02:30:00Z",
      actual_pickup_time: "2025-12-19T02:35:00Z",
      actual_drop_time: null,

      pickup_lat: 12.9249,
      pickup_lng: 80.1,
      pickup_address: "Tambaram, Chennai",

      drop_lat: 12.616,
      drop_lng: 80.199,
      drop_address: "Mahabalipuram",

      Estimate_km: 58,
      distance_km: 60,
      trip_duration_minutes: 90,
      waiting_time_minutes: 0,

      base_fare: 400,

      distance_fare_per_km: 13,
      distance_fare: 780,

      time_fare_per_minute: 2.5,
      time_fare: 225,
      payment_method: "UPI",

      waiting_charges: 0,
      driver_allowance: 300,
      return_compensation: 0,

      surge_multiplier: 1,
      surge_pricing: 0,

      tip: 0,
      toll_charges: 100,
      night_charges: 0,

      discount: 0,

      subtotal: 1805,

      gst_percentage: 5,
      gst_amount: 90.25,

      platform_fee: 100,

      total_fare: 1995.25,
      paid_amount: 0,
      payment_status: "PENDING",

      cancel_reason: null,
      cancel_by: null,
      notes: null,

      created_at: "2025-12-19T02:00:00Z",
      updated_at: "2025-12-19T02:35:00Z",
      assigned_at: "2025-12-19T02:10:00Z",
      started_at: "2025-12-19T02:35:00Z",
      ended_at: null,

      trip_changes: [],
    },

    {
      trip_id: "trip_live_001",
      user_id: "user_301",
      user_name: "Karthik",
      user_phone: "9000011111",

      driver_id: "driver_701",
      driver_name: "Manoj",
      driver_phone: "9888877777",

      vehicle_id: "vehicle_02",
      car_number: "AP16LM5678",
      car_type: "Sedan",

      ride_type: "ONE_WAY",
      service_type: "DRIVER_ONLY",
      trip_status: "LIVE",

      original_scheduled_start_time: "2025-12-19T09:00:00Z",
      scheduled_start_time: "2025-12-19T09:00:00Z",
      actual_pickup_time: "2025-12-19T09:05:00Z",
      actual_drop_time: null,

      pickup_lat: 12.9716,
      pickup_lng: 77.5946,
      pickup_address: "Indiranagar, Bangalore",

      drop_lat: 12.8456,
      drop_lng: 77.6603,
      drop_address: "Electronic City, Bangalore",

      Estimate_km: 18,
      distance_km: 9.5,
      trip_duration_minutes: 25,
      waiting_time_minutes: 0,

      base_fare: 300,
      distance_fare_per_km: 13,
      distance_fare: 123.5,
      time_fare_per_minute: 1.5,
      time_fare: 37.5,
      waiting_charges: 0,
      driver_allowance: 150,
      return_compensation: 0,
      surge_multiplier: 1,
      surge_pricing: 0,
      tip: 0,
      toll_charges: 0,
      night_charges: 0,
      discount: 0,

      subtotal: 611,
      gst_percentage: 5,
      gst_amount: 30.55,
      platform_fee: 80,

      total_fare: 721.55,
      paid_amount: 0,
      payment_status: "PENDING",
      payment_method: "UPI",

      cancel_reason: null,
      cancel_by: null,
      notes: null,

      created_at: "2025-12-19T08:15:00Z",
      updated_at: "2025-12-19T09:20:00Z",
      assigned_at: "2025-12-19T08:40:00Z",
      started_at: "2025-12-19T09:05:00Z",
      ended_at: null,

      trip_changes: [],
    },

    {
      trip_id: "trip_req_001",
      user_id: "user_302",
      user_name: "Anitha",
      user_phone: "9000022222",

      driver_id: null,
      driver_name: null,
      driver_phone: null,

      vehicle_id: "vehicle_03",
      car_number: "WB24NP4321",
      car_type: "Hatchback",

      ride_type: "ONE_WAY",
      service_type: "DRIVER_ONLY",
      trip_status: "REQUESTED",

      original_scheduled_start_time: "2025-12-19T11:00:00Z",
      scheduled_start_time: "2025-12-19T11:00:00Z",
      actual_pickup_time: null,
      actual_drop_time: null,

      pickup_lat: 12.9165,
      pickup_lng: 77.6101,
      pickup_address: "BTM Layout, Bangalore",

      drop_lat: 12.9718,
      drop_lng: 77.7499,
      drop_address: "Whitefield, Bangalore",

      Estimate_km: 20,
      distance_km: 0,
      trip_duration_minutes: 0,
      waiting_time_minutes: 0,

      base_fare: 300,
      distance_fare_per_km: 13,
      distance_fare: 0,
      time_fare_per_minute: 1.5,
      time_fare: 0,
      waiting_charges: 0,
      driver_allowance: 150,
      return_compensation: 0,
      surge_multiplier: 1,
      surge_pricing: 0,
      tip: 0,
      toll_charges: 0,
      night_charges: 0,
      discount: 0,

      subtotal: 450,
      gst_percentage: 5,
      gst_amount: 22.5,
      platform_fee: 80,

      total_fare: 552.5,
      paid_amount: 0,
      payment_status: "PENDING",
      payment_method: "WALLET",

      cancel_reason: null,
      cancel_by: null,
      notes: "Driver yet to be assigned",

      created_at: "2025-12-19T07:30:00Z", // < 5 hrs
      updated_at: "2025-12-19T07:30:00Z",
      assigned_at: null,
      started_at: null,
      ended_at: null,

      trip_changes: [],
    },

    {
      trip_id: "trip_req_002",
      user_id: "user_303",
      user_name: "Suresh",
      user_phone: "9000033333",

      driver_id: null,
      driver_name: null,
      driver_phone: null,

      vehicle_id: "vehicle_04",
      car_number: "GJ01QR8765",
      car_type: "SUV",

      ride_type: "ROUND_TRIP",
      service_type: "DRIVER_ONLY",
      trip_status: "REQUESTED",

      original_scheduled_start_time: "2025-12-19T10:30:00Z",
      scheduled_start_time: "2025-12-19T10:30:00Z",
      actual_pickup_time: null,
      actual_drop_time: null,

      pickup_lat: 13.0827,
      pickup_lng: 80.2707,
      pickup_address: "Tambaram, Chennai",

      drop_lat: 12.6208,
      drop_lng: 80.1937,
      drop_address: "Mahabalipuram, Chennai",

      Estimate_km: 60,
      distance_km: 0,
      trip_duration_minutes: 0,
      waiting_time_minutes: 0,

      base_fare: 400,
      distance_fare_per_km: 12,
      distance_fare: 0,
      time_fare_per_minute: 1.5,
      time_fare: 0,
      waiting_charges: 0,
      driver_allowance: 200,
      return_compensation: 0,
      surge_multiplier: 1,
      surge_pricing: 0,
      tip: 0,
      toll_charges: 0,
      night_charges: 0,
      discount: 0,

      subtotal: 600,
      gst_percentage: 5,
      gst_amount: 30,
      platform_fee: 80,

      total_fare: 710,
      paid_amount: 0,
      payment_status: "PENDING",
      payment_method: "UPI",

      cancel_reason: null,
      cancel_by: null,
      notes: null,

      created_at: "2025-12-19T06:30:00Z", // < 5 hrs
      updated_at: "2025-12-19T06:30:00Z",
      assigned_at: null,
      started_at: null,
      ended_at: null,

      trip_changes: [],
    },
    {
      trip_id: "trip_up_001",
      user_id: "user_304",
      user_name: "Priya",
      user_phone: "9000044444",

      driver_id: null,
      driver_name: null,
      driver_phone: null,

      vehicle_id: "vehicle_05",
      car_number: "RJ14ST1098",
      car_type: "Luxury Sedan",

      ride_type: "ONE_WAY",
      service_type: "DRIVER_ONLY",
      trip_status: "UPCOMING",

      original_scheduled_start_time: "2025-12-19T18:00:00Z",
      scheduled_start_time: "2025-12-19T18:00:00Z",
      actual_pickup_time: null,
      actual_drop_time: null,

      pickup_lat: 17.4948,
      pickup_lng: 78.3996,
      pickup_address: "Kukatpally, Hyderabad",

      drop_lat: 17.4483,
      drop_lng: 78.3915,
      drop_address: "Hitech City, Hyderabad",

      Estimate_km: 15,
      distance_km: 0,
      trip_duration_minutes: 0,
      waiting_time_minutes: 0,

      base_fare: 280,
      distance_fare_per_km: 12,
      distance_fare: 0,
      time_fare_per_minute: 1.5,
      time_fare: 0,
      waiting_charges: 0,
      driver_allowance: 120,
      return_compensation: 0,
      surge_multiplier: 1,
      surge_pricing: 0,
      tip: 0,
      toll_charges: 0,
      night_charges: 0,
      discount: 30,

      subtotal: 370,
      gst_percentage: 5,
      gst_amount: 18.5,
      platform_fee: 80,

      total_fare: 468.5,
      paid_amount: 468.5,
      payment_status: "PAID",
      payment_method: "UPI",

      cancel_reason: null,
      cancel_by: null,
      notes: null,

      created_at: "2025-12-19T09:00:00Z", // > 5 hrs
      updated_at: "2025-12-19T09:00:00Z",
      assigned_at: null,
      started_at: null,
      ended_at: null,

      trip_changes: [],
    },
    {
      trip_id: "trip_up_002",
      user_id: "user_305",
      user_name: "Rahul",
      user_phone: "9000055555",

      driver_id: null,
      driver_name: null,
      driver_phone: null,

      vehicle_id: "vehicle_06",
      car_number: "RJ14ST1098",
      car_type: "Luxury Sedan",

      ride_type: "ONE_WAY",
      service_type: "DRIVER_ONLY",
      trip_status: "UPCOMING",

      original_scheduled_start_time: "2025-12-20T07:00:00Z",
      scheduled_start_time: "2025-12-20T07:00:00Z",
      actual_pickup_time: null,
      actual_drop_time: null,

      pickup_lat: 13.0878,
      pickup_lng: 80.2785,
      pickup_address: "Anna Nagar, Chennai",

      drop_lat: 13.0827,
      drop_lng: 80.2707,
      drop_address: "Chennai Airport",

      Estimate_km: 22,
      distance_km: 0,
      trip_duration_minutes: 0,
      waiting_time_minutes: 0,

      base_fare: 300,
      distance_fare_per_km: 13,
      distance_fare: 0,
      time_fare_per_minute: 1.5,
      time_fare: 0,
      waiting_charges: 0,
      driver_allowance: 150,
      return_compensation: 0,
      surge_multiplier: 1,
      surge_pricing: 0,
      tip: 0,
      toll_charges: 0,
      night_charges: 0,
      discount: 20,

      subtotal: 430,
      gst_percentage: 5,
      gst_amount: 21.5,
      platform_fee: 80,

      total_fare: 531.5,
      paid_amount: 531.5,
      payment_status: "PAID",
      payment_method: "CARD",

      cancel_reason: null,
      cancel_by: null,
      notes: null,

      created_at: "2025-12-19T18:00:00Z", // > 5 hrs
      updated_at: "2025-12-19T18:00:00Z",
      assigned_at: null,
      started_at: null,
      ended_at: null,

      trip_changes: [],
    },
  ],
  loading: false,
  error: null,
};

export type TripHistoryItem = {
  id: string;
  change_type: "DRIVER" | "FARE" | "SCHEDULE_TIME" | "STATUS";
  old_value: Record<string, any>;
  new_value: Record<string, any>;
  changed_by: "USER" | "DRIVER" | "SYSTEM" | "ADMIN";
  changed_at: string;
  notes?: string | null;
};

export const buildTripHistory = (trip: TripDetailsType): TripHistoryItem[] => {
  const history: TripHistoryItem[] = [];

  // 1️⃣ SYSTEM: Driver auto assigned (None → Driver)
  if (trip.assigned_at && trip.driver_name) {
    history.push({
      id: "system_driver_assign",
      change_type: "DRIVER",
      old_value: { driver_name: "None" },
      new_value: { driver_name: trip.driver_name },
      changed_by: "SYSTEM",
      changed_at: trip.assigned_at,
      notes: "Auto-assigned based on proximity",
    });
  }

  // 2️⃣ USER: Backend changes (if any)
  // if (Array.isArray(trip.trip_changes)) {
  //   history.push(...trip.trip_changes);
  // }

  // 3️⃣ STATUS: Requested → Live
  if (trip.started_at) {
    history.push({
      id: "status_live",
      change_type: "STATUS",
      old_value: { trip_status: "REQUESTED" },
      new_value: { trip_status: "LIVE" },
      changed_by: "DRIVER",
      changed_at: trip.started_at,
      notes: "Trip started",
    });
  }

  // 4️⃣ STATUS: Live → Completed
  if (trip.ended_at) {
    history.push({
      id: "status_completed",
      change_type: "STATUS",
      old_value: { trip_status: "LIVE" },
      new_value: { trip_status: "COMPLETED" },
      changed_by: "SYSTEM",
      changed_at: trip.ended_at,
      notes: "Trip completed",
    });
  }

  // 5️⃣ Sort everything by time
  return history.sort(
    (a, b) =>
      new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime(),
  );
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
  },
);

const tripSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {
    clearTrips: (state) => {
      state.trips = [];
    },

    assignDriverUI: (
      state,
      action: {
        payload: {
          trip_id: string;
          driver_id: string;
          driver_name: string;
          driver_phone: string;
        };
      },
    ) => {
      const trip = state.trips.find(
        (t) => t.trip_id === action.payload.trip_id,
      );

      if (trip) {
        trip.driver_id = action.payload.driver_id;
        trip.driver_name = action.payload.driver_name;
        trip.driver_phone = action.payload.driver_phone;
        trip.assigned_at = new Date().toISOString();
      }
    },

    adjustFareUI: (
      state,
      action: {
        payload: {
          trip_id: string;
          total_fare: number;
        };
      },
    ) => {
      const trip = state.trips.find(
        (t) => t.trip_id === action.payload.trip_id,
      );

      if (trip) {
        trip.total_fare = action.payload.total_fare;
        trip.updated_at = new Date().toISOString();
      }
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

export const { clearTrips, assignDriverUI, adjustFareUI } = tripSlice.actions;
export default tripSlice.reducer;
