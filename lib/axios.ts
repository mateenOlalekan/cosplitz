// lib/axios.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// REMOVE the request interceptor that reads from localStorage
// The Zustand persist middleware already handles this

// Only keep response interceptor for error handling
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - redirecting to login");
      // Don't clear localStorage here - let Zustand handle it
      // Just redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    
    if (error.response?.status === 403) {
      console.warn("Access forbidden");
    }
    
    return Promise.reject(error);
  }
);