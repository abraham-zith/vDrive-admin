import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
  fetchCountries,
  loadMoreCountries,
  clearCountryError,
  resetCountries,
} from "../store/slices/pricingSlice";
import { selectIsAuthenticated } from "../store/slices/authSlice";

export const usePricingData = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Select countries data from pricing slice
  const countries = useAppSelector((state) => state.pricing.countries);
  const totalCountries = useAppSelector(
    (state) => state.pricing.totalCountries
  );
  const loadedCountries = useAppSelector(
    (state) => state.pricing.loadedCountries
  );
  const hasMore = useAppSelector((state) => state.pricing.hasMore);
  const countryLoading = useAppSelector(
    (state) => state.pricing.countryLoading
  );
  const countryError = useAppSelector((state) => state.pricing.countryError);

  const loadCountries = useCallback(
    (limit?: number) => {
      if (isAuthenticated) {
        dispatch(fetchCountries({ limit }));
      }
    },
    [dispatch, isAuthenticated]
  );

  const loadMore = useCallback(
    (limit?: number) => {
      if (isAuthenticated && hasMore && !countryLoading) {
        dispatch(
          loadMoreCountries({
            offset: loadedCountries,
            limit,
          })
        );
      }
    },
    [dispatch, isAuthenticated, hasMore, countryLoading, loadedCountries]
  );

  const clearError = useCallback(() => {
    dispatch(clearCountryError());
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(resetCountries());
  }, [dispatch]);

  // Auto-load data when hook is first used
  useEffect(() => {
    if (isAuthenticated && countries.length === 0) {
      loadCountries();
    }
  }, [isAuthenticated, loadCountries, countries.length]);

  return {
    // Data
    countries,
    totalCountries,
    loadedCountries,
    hasMore,

    // Status
    loading: countryLoading,
    error: countryError,

    // Actions
    loadCountries,
    loadMore,
    clearError,
    reset,
  };
};
