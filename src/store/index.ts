import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import locationReducer from "./slices/locationSlice";
import tripReducer from "./slices/tripSlice";
import pricingFareRulesReducer from "./slices/pricingFareRulesSlice";
import hotspotReducer from "./slices/hotspotSlice";
import customerReducer from "./slices/customerSlice";
import tripTransactionReducer from "./slices/tripTransactionSlice";
import taxReducer from "./slices/taxSlice";
import pricingCombinationReducer from "./slices/pricingCombinationSlice";
import sosReducer from "./slices/sosSlice";
import adminReducer from "./slices/adminSlice";
import driverReducer from "./slices/driverSlice";
import couponReducer from "./slices/couponSlice";
import referralReducer from "./slices/referralSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    trips: tripReducer,
    pricingFareRules: pricingFareRulesReducer,
    hotspot: hotspotReducer,
    customers: customerReducer,
    tripTransaction: tripTransactionReducer,
    tax: taxReducer,
    pricingCombination: pricingCombinationReducer,
    admin: adminReducer,
    drivers: driverReducer,
    sos: sosReducer,
    coupon: couponReducer,
    referral: referralReducer,
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
