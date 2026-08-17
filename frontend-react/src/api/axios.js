import axios from "axios";

const api = axios.create({
  baseURL: "YOUR_BASE_URL",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    // Successful response
    return response;
  },
  (error) => {
    // Check for 401 Unauthorized
    if (error.response?.status === 401) {
      // Remove token
      localStorage.removeItem("token");

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
