import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  loginAsync,
  logoutAsync,
  checkAuthStatus,
} from "../store/slices/authSlice";
import type { Login } from "../login/Login";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: Login) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, error } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Check auth status on mount
    dispatch(checkAuthStatus());

    // Listen for storage changes to update auth state
    const handleStorageChange = () => {
      dispatch(checkAuthStatus());
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  const login = useCallback(
    async (credentials: Login) => {
      await dispatch(loginAsync(credentials)).unwrap();
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutAsync()).unwrap();
  }, [dispatch]);

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      loading,
      error,
      login,
      logout,
    }),
    [isAuthenticated, loading, error, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
