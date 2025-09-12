import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "../api/axios";
import type { Login } from "../login/Login";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (credentials: Login) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!Cookies.get("auth_token")
  );

  useEffect(() => {
    const token = Cookies.get("auth_token");
    setIsAuthenticated(!!token);
  }, []);

  const login = async (credentials: Login) => {
    await axios.post("/api/auth/signIn", {
      user_name: credentials.userName,
      password: credentials.password,
    });
    // After the request, the cookie should be set by the browser.
    // Let's check for it to confirm authentication.
    const token = Cookies.get("auth_token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      // This will help in debugging if the cookie is not set or is HttpOnly
      console.error("Login successful, but auth_token cookie not found.");
      throw new Error("Authentication failed: token not found.");
    }
  };

  const logout = async () => {
    await axios.get("/api/auth/signout");
    Cookies.remove("auth_token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
