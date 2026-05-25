import { env } from "@/shared/config/env";
import { tokenStorage } from "@/shared/lib/storage";
import { ApiEnvelope, ApiException } from "./types";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
  /** Internal — prevent infinite refresh loops. */
  _retry?: boolean;
}

let refreshInFlight: Promise<string | null> | null = null;

const buildUrl = (path: string, query?: RequestOptions["query"]): string => {
  const url = new URL(path, env.apiBaseUrl);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.append(key, String(value));
    });
  }
  return url.toString();
};

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return null;

  refreshInFlight = (async () => {
    try {
      const response = await fetch(buildUrl("/api/v1/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (!response.ok) {
        tokenStorage.clear();
        return null;
      }
      const payload = (await response.json()) as ApiEnvelope<{
        accessToken: string;
        refreshToken: string;
      }>;
      if (!payload.success) {
        tokenStorage.clear();
        return null;
      }
      tokenStorage.set(payload.data.accessToken, payload.data.refreshToken);
      return payload.data.accessToken;
    } catch {
      tokenStorage.clear();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, auth = true, headers, _retry, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...((headers as Record<string, string>) ?? {}),
  };

  if (auth) {
    const token = tokenStorage.getAccess();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  if (response.status === 401 && auth && !_retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiRequest<T>(path, { ...options, _retry: true });
    }
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // ignore — fall through to status-based error
  }

  if (!response.ok || !payload || !payload.success) {
    const error =
      payload && !payload.success
        ? payload.error
        : { code: `HTTP_${response.status}`, message: response.statusText || "Request failed" };
    throw new ApiException(response.status, error);
  }

  return payload.data;
}

export async function apiRequestPaged<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta?: import("./types").ApiMeta }> {
  const { body, query, auth = true, headers, _retry, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...((headers as Record<string, string>) ?? {}),
  };

  if (auth) {
    const token = tokenStorage.getAccess();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (response.status === 401 && auth && !_retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiRequestPaged<T>(path, { ...options, _retry: true });
    }
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) {
    const error =
      payload && !payload.success
        ? payload.error
        : { code: `HTTP_${response.status}`, message: response.statusText || "Request failed" };
    throw new ApiException(response.status, error);
  }

  return { data: payload.data, meta: payload.meta };
}
