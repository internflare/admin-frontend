/**
 * Internflare Admin API Client (Phase 1 Foundation)
 *
 * Enforces:
 * 1. Strict `credentials: "include"` on all requests for HTTP-only `admin_session` cookie transmission.
 * 2. Automatic `X-Correlation-ID` generation and propagation for distributed request tracing.
 * 3. Centralized RFC-compliant error mapping with Sonner toast feedback and deduplication.
 * 4. Custom event dispatching on 401 Unauthorized for reactive session termination.
 */

import { toast } from "sonner";

const rawBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1/admin";
export const API_BASE_URL = rawBase.replace(/\/+$/, "");

/**
 * Generates a unique correlation ID per request for tracing across Gateway,
 * admin-service, and the immutable audit log.
 */
export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${rand}`;
}

export interface ApiErrorData {
  message?: string;
  error?: string;
  code?: string;
  details?: unknown;
  errors?: Array<{ field?: string; message?: string } | string>;
  [key: string]: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly data?: ApiErrorData;
  readonly code?: string;
  readonly correlationId?: string;

  constructor(status: number, statusText: string, data?: ApiErrorData, correlationId?: string) {
    const msg = data?.message || data?.error || statusText || `Request failed with status ${status}`;
    super(msg);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.code = data?.code;
    this.correlationId = correlationId;
  }
}

// In-flight deduplication cache to prevent toast spamming on concurrent requests
const recentToasts = new Map<string, number>();
const TOAST_DEDUPE_WINDOW_MS = 2000;

function showDeduplicatedToast(
  key: string,
  type: "error" | "warning",
  message: string,
  description?: string,
): void {
  const now = Date.now();
  const last = recentToasts.get(key) ?? 0;
  if (now - last < TOAST_DEDUPE_WINDOW_MS) return;
  recentToasts.set(key, now);

  if (type === "warning") {
    toast.warning(message, { description, duration: 5000 });
  } else {
    toast.error(message, { description, duration: 6000 });
  }
}

/**
 * Maps HTTP status codes to user-friendly Sonner toast notifications.
 * Dispatches an event on 401 so the auth provider can react immediately.
 */
export function handleApiError(error: unknown, silent = false): ApiError {
  let apiError: ApiError;

  if (error instanceof ApiError) {
    apiError = error;
  } else if (error instanceof Error) {
    if (error.name === "AbortError") {
      apiError = new ApiError(499, "Client Closed Request", { message: "Request was cancelled." });
    } else {
      // TypeError is thrown by fetch on network failure or gateway offline
      apiError = new ApiError(0, "Network Error", {
        message: `Unable to connect to API Gateway at ${API_BASE_URL}. Ensure the service is running.`,
      });
    }
  } else {
    apiError = new ApiError(500, "Unknown Error", { message: String(error) });
  }

  if (silent) return apiError;

  const { status, data, correlationId } = apiError;
  const detailMsg = data?.message || data?.error;
  const dedupeKey = `${status}:${detailMsg ?? apiError.message}`;

  switch (status) {
    case 400: {
      let description = detailMsg;
      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        description = data.errors
          .map((e) => (typeof e === "string" ? e : e.field ? `${e.field}: ${e.message}` : e.message))
          .filter(Boolean)
          .join(" · ");
      }
      showDeduplicatedToast(dedupeKey, "error", "Invalid Request", description ?? "Please check the form inputs.");
      break;
    }
    case 401: {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("internflare:unauthorized", { detail: { apiError } }));
      }
      showDeduplicatedToast("401_unauthorized", "warning", "Session Expired", "Please sign in again to continue.");
      break;
    }
    case 403: {
      showDeduplicatedToast(
        dedupeKey,
        "error",
        "Access Denied",
        detailMsg || "You lack the required permission to perform this action.",
      );
      break;
    }
    case 404: {
      showDeduplicatedToast(dedupeKey, "error", "Not Found", detailMsg || "The requested record was not found.");
      break;
    }
    case 429: {
      showDeduplicatedToast(
        dedupeKey,
        "warning",
        "Rate Limit Exceeded",
        detailMsg || "Too many requests. Please wait a moment before trying again.",
      );
      break;
    }
    case 502:
    case 503:
    case 504: {
      showDeduplicatedToast(
        "gateway_unavailable",
        "error",
        "Service Unavailable",
        "The backend service is temporarily unreachable. Please retry in a few moments.",
      );
      break;
    }
    case 0: {
      showDeduplicatedToast(
        "network_offline",
        "error",
        "Network Connection Error",
        `Could not reach API Gateway at ${API_BASE_URL}. Ensure gateway-service is active.`,
      );
      break;
    }
    default: {
      if (status >= 500) {
        showDeduplicatedToast(
          dedupeKey,
          "error",
          "Server Error",
          `${detailMsg || "An unexpected error occurred."}${correlationId ? ` (Ref: ${correlationId})` : ""}`,
        );
      }
      break;
    }
  }

  return apiError;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  silentErrorToast?: boolean;
  body?: unknown;
}

function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  const cleanPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = new URL(`${API_BASE_URL}${cleanPath}`);

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        fullUrl.searchParams.append(key, String(val));
      }
    });
  }

  return fullUrl.toString();
}

/**
 * Core HTTP Request Execution.
 * Guaranteed credentials: "include" for HTTP-only cookies on every request.
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, silentErrorToast = false, body, headers: customHeaders, ...fetchInit } = options;
  const url = buildUrl(endpoint, params);
  const correlationId = generateCorrelationId();

  const headers = new Headers(customHeaders);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (!headers.has("X-Correlation-ID")) {
    headers.set("X-Correlation-ID", correlationId);
  }

  let serializedBody: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (typeof body === "string" || body instanceof FormData || body instanceof Blob) {
      serializedBody = body as BodyInit;
    } else {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      serializedBody = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchInit,
      headers,
      body: serializedBody,
      credentials: "include", // Essential: Transmits & captures the admin_session HTTP-Only cookie
    });

    const responseCorrelationId = response.headers.get("X-Correlation-ID") || correlationId;

    if (!response.ok) {
      let errorData: ApiErrorData | undefined;
      try {
        const contentType = response.headers.get("Content-Type") || "";
        if (contentType.includes("application/json")) {
          errorData = (await response.json()) as ApiErrorData;
        } else {
          const text = await response.text();
          errorData = { message: text };
        }
      } catch {
        /* Response body parsing failed */
      }

      const apiError = new ApiError(response.status, response.statusText, errorData, responseCorrelationId);
      throw handleApiError(apiError, silentErrorToast);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw handleApiError(err, silentErrorToast);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body }),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", body }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
  request,
  raw: (endpoint: string, options?: RequestOptions) => {
    const { params, headers: customHeaders, body, ...fetchInit } = options ?? {};
    const url = buildUrl(endpoint, params);
    const headers = new Headers(customHeaders);
    headers.set("X-Correlation-ID", generateCorrelationId());

    let serializedBody: BodyInit | undefined;
    if (body !== undefined && body !== null) {
      if (typeof body === "string" || body instanceof FormData || body instanceof Blob) {
        serializedBody = body as BodyInit;
      } else {
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }
        serializedBody = JSON.stringify(body);
      }
    }

    return fetch(url, { ...fetchInit, headers, body: serializedBody, credentials: "include" });
  },
};
