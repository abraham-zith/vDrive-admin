import React, { useState } from "react";
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

const ReduxExample: React.FC = () => {
  const dispatch = useAppDispatch();

  // Auth selectors
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);

  // Local state for demo
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password");

  const handleLogin = async () => {
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      alert(`Login Successful! Welcome back, ${result.name}!`);
    } catch (error) {
      alert("Login Failed: Please check your credentials and try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      alert("You have been successfully logged out.");
    } catch (error) {
      alert("Logout Failed: There was an error logging out.");
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Redux Toolkit Auth Demo</h1>

      {/* Auth Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Authentication</h2>

        {authError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">Error:</p>
            <p>{authError}</p>
            <button
              onClick={handleClearError}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Clear Error
            </button>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter password"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={authLoading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {authLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p className="font-semibold">Welcome!</p>
              <p>Name: {user?.name}</p>
              <p>Email: {user?.email}</p>
              <p>Role: {user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={authLoading}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50"
            >
              {authLoading ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}
      </div>

      {/* Redux DevTools Info */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Redux DevTools</h3>
        <p className="text-sm text-gray-600">
          Open Redux DevTools in your browser to see state changes in real-time.
          You can inspect the current state, dispatch actions, and time-travel
          debug.
        </p>
      </div>
    </div>
  );
};

export default ReduxExample;
