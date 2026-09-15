import axios, { AxiosError } from "axios";

/**
 * Central API client for the RentNest backend.
 * - baseURL comes from env (NEXT_PUBLIC_API_BASE_URL)
 * - cookies are sent cross-origin so the backend httpOnly `accessToken`
 *   cookie reaches the Express auth middleware on every request
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://rent-nest-navy.vercel.app";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Raw backend response envelope: { success, message, data, meta? } */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

/** Normalized error shape used across the whole UI */
export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

/** Extract a normalized ApiError from any thrown value */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  const axiosError = error as AxiosError<{ message?: string; data?: { message?: string } }>;

  if (axiosError?.isAxiosError) {
    const status = axiosError.response?.status ?? 0;

    // Network failure (no response at all)
    if (!axiosError.response) {
      return new ApiError(
        "Cannot reach the server. Please check your internet connection and try again.",
        0
      );
    }

    const payload = axiosError.response.data as
      | { message?: string; errorSources?: { message?: string }[] }
      | undefined;

    const message =
      payload?.message ||
      payload?.errorSources?.[0]?.message ||
      axiosError.message ||
      "Something went wrong";

    return new ApiError(message, status);
  }

  return new ApiError(
    error instanceof Error ? error.message : "An unexpected error occurred",
    500
  );
}

/** Unwrap the backend envelope and return typed data (throws ApiError on failure) */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  try {
    const res = await apiClient.get<ApiEnvelope<T>>(url, { params });
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function apiGetWithMeta<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<{ data: T; meta?: ApiEnvelope<T>["meta"] }> {
  try {
    const res = await apiClient.get<ApiEnvelope<T>>(url, { params });
    return { data: res.data.data, meta: res.data.meta };
  } catch (error) {
    throw toApiError(error);
  }
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  try {
    const res = await apiClient.post<ApiEnvelope<T>>(url, body);
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  try {
    const res = await apiClient.patch<ApiEnvelope<T>>(url, body);
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  try {
    const res = await apiClient.put<ApiEnvelope<T>>(url, body);
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}
