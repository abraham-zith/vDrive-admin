import React, { createContext, useContext, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "../store/store";
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  loginUser,
  logoutUser,
  clearError,
  selectAuthError,
} from "../store/slices/authSlice";
import { setAuthToken, clearAuthToken } from "../api/axios";
import type { Login } from "../login/Login";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: any;
  error: string | null;
  login: (credentials: Login) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const user = useAppSelector(selectUser);
  const error = useAppSelector(selectAuthError);

  const login = async (credentials: Login) => {
    try {
      const result = await dispatch(
        loginUser({
          email: credentials.userName, // Map userName to email for Redux
          password: credentials.password,
        })
      ).unwrap();

      // Set token for API calls (handles both localStorage and axios headers)
      if (result.token) {
        setAuthToken(result.token);
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      clearAuthToken(); // Clears both localStorage and axios headers
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      loading,
      user,
      error,
      login,
      logout,
      clearError: clearAuthError,
    }),
    [isAuthenticated, loading, user, error, login, logout]
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
