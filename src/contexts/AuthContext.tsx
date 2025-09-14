import React, { createContext, useState, useContext, useEffect } from "react";
import axiosIns from "../api/axios";
import type { Login } from "../login/Login";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: Login) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("accessToken")
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);
  }, []);

  const login = async (credentials: Login) => {
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
  };

  const logout = async () => {
    setLoading(true);
    try {
      console.log("Logging out...");
      const { data } = await axiosIns.post("/api/auth/signout");
      if (data?.success) {
        localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
