import axios from "axios";

const isLocal = window.location.hostname === "localhost";

const newRequest = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
});


newRequest.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default newRequest;