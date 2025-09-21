import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Token management functions
export const setAuthToken = (token: string) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("accessToken", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("accessToken");
  }
};

export const clearAuthToken = () => {
  delete api.defaults.headers.common["Authorization"];
  localStorage.removeItem("accessToken");
};

// Auto-set token from localStorage on startup
const token = localStorage.getItem("accessToken");
if (token) {
  setAuthToken(token);
}

// Request interceptor for authorization
api.interceptors.request.use((config) => {
  // Token already set via setAuthToken, but can add other headers here
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use a separate axios instance for refresh to avoid interceptors
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data?.data?.accessToken;

        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          setAuthToken(newToken);
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Clear token and handle logout via Redux action if possible
        localStorage.removeItem("accessToken");
        clearAuthToken();
        // Re-throw to allow component-level error handling
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
