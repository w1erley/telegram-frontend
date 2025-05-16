import axios from "axios";
import Cookies from "js-cookie"

import { apiUrl } from "@/lib/utils/constants/url";

const API_BASE_URL = apiUrl || "https://api.example.com";

export const api = axios.create({
    baseURL: API_BASE_URL
});

api.interceptors.request.use(
  (config) => {
      const token = Cookies.get("access_token");
      if (token) {
          config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
  },
  (error) => {
      return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "Token refreshed" &&
      error.response?.data?.auth_token &&
      !originalRequest._retry
    ) {
      const newToken = error.response.data.auth_token;
      console.info("Token refreshed, retrying request...");

      Cookies.set("access_token", newToken);

      originalRequest._retry = true;

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    }

    if (error.response?.status === 401) {
      console.warn("Unauthorized: Redirecting to login...");
      Cookies.remove("access_token");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);