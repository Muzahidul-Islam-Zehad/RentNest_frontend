import axios, { AxiosError } from "axios";

/**
 * Central API client for the RentNest backend.
 *
 * All calls go to our own Next.js catch-all proxy route (/api/[...path]) which
 * forwards them to the backend (API_PROXY_TARGET). This keeps the browser
 * same-origin — the backend's wildcard CORS policy cannot authorize
 * credentialed cross-origin requests, so direct browser → backend calls are
 * blocked. The proxy also attaches the JWT session cookie server-side.
 *
 * Service-layer paths already start with `/api/...` (same-origin), so no axios
 * baseURL is set — a baseURL would double the prefix (e.g. /api/api/properties).
 */

export const apiClient = axios.create({
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
