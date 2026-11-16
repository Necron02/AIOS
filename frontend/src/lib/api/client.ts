// API Client — V0.1 implementation
import axios, { AxiosError, AxiosInstance } from "axios";

const API_URL =
  (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
    .VITE_API_URL || "http://127.0.0.1:8000";

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = error.response?.data
      ? (error.response.data as { detail?: string }).detail ||
        JSON.stringify(error.response.data)
      : error.message;
    console.error("API Error:", message);
    return Promise.reject(error);
  },
);

// Health check types
export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  version: string;
  database: "healthy" | "degraded" | "unhealthy" | "unknown";
  timestamp: string;
}

export interface VersionResponse {
  version: string;
  name: string;
  description: string;
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await api.get<HealthResponse>("/api/health");
  return response.data;
}

export async function getVersion(): Promise<VersionResponse> {
  const response = await api.get<VersionResponse>("/api/version");
  return response.data;
}
