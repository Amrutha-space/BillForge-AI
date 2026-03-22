import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080",
  withCredentials: true,
  headers: {
    "content-type": "application/json"
  }
});

export type AuthMe = { userId: string; role: "PLATFORM_ADMIN" | "COMPANY_ADMIN" | "CUSTOMER"; companyId: string | null };
