import axios from "axios";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (request) => {
    const token = localStorage.getItem("token");

    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    return request;
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
      // catching error from middleware(backend) wrt token verification
      if (error.response?.data?.code === "authentication") {
        // remove token and user from cache/localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = `/login?errMsg=${error.response?.data?.message}`;
        return;
      }
      //if status 401 other than login or authenticateToken middleware then generic, go to login page
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = `/login?errMsg=${error.response?.data?.message}`;
      return error;
    }
    // send error to the page for it to be taken care of
    return Promise.reject(error);
  },
);

export default api;
