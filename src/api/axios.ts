import axios from 'axios';

const axiosIns = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

axiosIns.interceptors.request.use((config) => {
  config.headers["authorization"] = `Bearer ${localStorage.getItem("accessToken") || ""}`;
  // config.headers["x-region"] = region;
 

  return config;
});

axiosIns.interceptors.response.use(
  res => res,
  async err => {
    const originalConfig = err.config;
    if (err.response?.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;

      try {
        const { data } = await axios.post('api/auth/refresh-token',{},{withCredentials : true});
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        const token = data?.data?.accessToken || '';
        localStorage.setItem("accessToken", token);
        originalConfig.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return axiosIns(originalConfig);
      } catch (refreshError) {
        // Clear token and let app handle logout
        localStorage.removeItem("accessToken");
        throw new Error('Authentication failed'); // Let the component handle navigation
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(err);
  }
);

export default axiosIns;
