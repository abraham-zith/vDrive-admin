import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axiosIns from "../api/axios";
import type { Login } from "../login/Login";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: Login) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const getCookie = (name: string) => {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop()?.split(";").shift();
//   return null;
// };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("accessToken")
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    // const refreshToken = getCookie("refresh_token");

    // if (!refreshToken) {
    //   // No refresh token, logout immediately
    //   setIsAuthenticated(false);
    //   localStorage.removeItem("accessToken");
    // } else {
    setIsAuthenticated(!!token);
    // }

    // Listen for storage changes to update auth state
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("accessToken"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = useCallback(async (credentials: Login) => {
    setLoading(true);
    try {
      const response = await axiosIns.post("/api/auth/signIn", {
        user_name: credentials.userName,
        password: credentials.password,
      });

      const token = response.data.data.accessToken;
      localStorage.setItem("accessToken", token);
      if (token) {
        setIsAuthenticated(true);
      } else {
        console.error("Login successful, but auth_token cookie not found.");
        throw new Error("Authentication failed: token not found.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosIns.post("/api/auth/signout");
      if (data?.success) {
        localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      loading,
      login,
      logout,
    }),
    [isAuthenticated, loading, login, logout]
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
