import axios from "axios";

const TOKEN_STORAGE_KEY = "billforge_access_token";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080",
  withCredentials: true,
  headers: {
    "content-type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function persistAccessToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

export function clearAccessToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export type AuthMe = { userId: string; role: "PLATFORM_ADMIN" | "COMPANY_ADMIN" | "CUSTOMER"; companyId: string | null };
