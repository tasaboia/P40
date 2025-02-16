import Log from "@p40/services/logging";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    Log(error);
    return Promise.reject(error);
  }
);

export default api;
