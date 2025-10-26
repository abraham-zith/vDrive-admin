import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
} from "react";
import { useAppSelector, useAppDispatch } from "../store/store";
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  loginUser,
  logoutUser,
  clearError,
  selectAuthError,
  getCurrentUser,
} from "../store/slices/authSlice";
import { setAuthToken, clearAuthToken } from "../api/axios";
import type { Login } from "../login/Login";

interface AuthContextType {
  isAuthenticated: boolean;
  authChecked: boolean;
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

  // State to track initial auth check
  const [authChecked, setAuthChecked] = useState(false);

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

  // Initialize auth state from API on component mount
  useEffect(() => {
    dispatch(getCurrentUser())
      .unwrap()
      .then(() => {
        setAuthChecked(true);
      })
      .catch(() => {
        setAuthChecked(true);
      });
  }, [dispatch]);

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      authChecked,
      loading,
      user,
      error,
      login,
      logout,
      clearError: clearAuthError,
    }),
    [isAuthenticated, authChecked, loading, user, error, login, logout]
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
