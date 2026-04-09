import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import locationReducer from "./slices/locationSlice";
import tripReducer from "./slices/tripSlice";
import pricingFareRulesReducer from "./slices/pricingFareRulesSlice";
import hotspotReducer from "./slices/hotspotSlice";
import adminReducer from "./slices/adminSlice";
import driverReducer from "./slices/driverSlice";
import sosReducer from "./slices/sosSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    trips: tripReducer,
    pricingFareRules: pricingFareRulesReducer,
    hotspot: hotspotReducer,
    admin: adminReducer,
    drivers: driverReducer,
    sos: sosReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
