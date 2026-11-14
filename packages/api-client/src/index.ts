import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { ApiErrorShape } from "@chand/types";

declare const process: any;

export class ApiError extends Error {
  public statusCode: number;
  public details?: Record<string, any>;
  public requestId?: string;
  public path?: string;

  constructor(errorShape: Partial<ApiErrorShape> & { message: string }) {
    super(Array.isArray(errorShape.message) ? errorShape.message.join(", ") : errorShape.message);
    this.name = "ApiError";
    this.statusCode = errorShape.statusCode || 500;
    this.details = errorShape.details;
    this.requestId = errorShape.requestId;
    this.path = errorShape.path;
  }
}

export interface ClientConfig {
  baseURL?: string;
  tokenCookieName?: string;
}

export function createApiClient(config: ClientConfig = {}): AxiosInstance {
  const tokenKey = config.tokenCookieName || "user_access_token";
  
  // Safe base URL determination
  const baseURL =
    config.baseURL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  // Request Interceptor: Inject Token & Request-ID
  client.interceptors.request.use(
    (reqConfig: InternalAxiosRequestConfig) => {
      const token = Cookies.get(tokenKey);
      if (token && reqConfig.headers) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }

      // Generate client-side request tracing ID if absent
      if (reqConfig.headers && !reqConfig.headers["x-request-id"]) {
        reqConfig.headers["x-request-id"] = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }

      return reqConfig;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: Normalize Errors & Handle 401
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorShape>) => {
      const status = error.response?.status;
      const data = error.response?.data;

      // Handle session expiry on 401
      if (status === 401) {
        Cookies.remove(tokenKey);
        Cookies.remove("user_data");
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          if (path.startsWith("/account") || path.startsWith("/(admin)")) {
            window.location.href = `/auth/login?redirect=${encodeURIComponent(path)}`;
          }
        }
      }

      const rawMessage = data?.message || error.message || "An unexpected error occurred";
      const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : String(rawMessage);

      const normalizedError = new ApiError({
        statusCode: status || 500,
        error: data?.error || error.name,
        message,
        details: data?.details,
        requestId: data?.requestId,
        path: data?.path || error.config?.url,
      });

      return Promise.reject(normalizedError);
    }
  );

  return client;
}

// Default export singleton
export const api = createApiClient();

