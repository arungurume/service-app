// Lightweight DS Hub service client — configure baseUrl/token and use exported functions.

// Replace concrete domain types with generic, re-usable types
export type ApiObject = Record<string, any>;
export type Id = number | string;

export interface PageableResponse<T = ApiObject> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  // ...other pageable meta
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  token?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

const defaultHeaders = {
  "Content-Type": "application/json",
};

/**
 * Simple request helper using fetch. Pass baseUrl when creating client.
 */
const request = async <T>(
  baseUrl: string,
  path: string,
  opts: RequestOptions = {}
): Promise<T> => {
  const url = `${baseUrl.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    ...defaultHeaders,
    ...(opts.headers || {}),
  };
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    //credentials: "include",
    signal: opts.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Request failed: ${res.status} ${res.statusText} ${text}`);
    // attach status for callers
    (err as any).status = res.status;
    throw err;
  }

  // attempt JSON parse, otherwise return empty
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  // @ts-ignore
  return (await res.text()) as T;
};

// Make the client generic so callers can provide concrete types if desired.
// Defaults use ApiObject for flexibility.
export type DSHubClient<TOrg = ApiObject, TLoc = ApiObject> = {
  listOrganizations: (params?: { page?: number; size?: number; q?: string }) => Promise<PageableResponse<TOrg>>;
  getOrganization: (orgId: Id) => Promise<TOrg>;
  updateOrganization: (orgId: Id, payload: Partial<TOrg>) => Promise<TOrg>;
  listLocations: (orgId: Id) => Promise<TLoc[]>;
};

// Changed code: derive baseUrl from env inside the factory and accept only token
export const createDSHubClient = (token?: string): DSHubClient => {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE && String(process.env.NEXT_PUBLIC_API_BASE)) || "https://api.example.com";

  // Adjust endpoints below to match your real API routes
  return {
    listOrganizations: async (params = {}) => {
      const q = params.q ? `&q=${encodeURIComponent(params.q)}` : "";
      const page = params.page ?? 0;
      const size = params.size ?? 10;
      const path = `/api/organizations?page=${page}&size=${size}${q}`;
      return request<PageableResponse<any>>(baseUrl, path, { token });
    },

    getOrganization: async (orgId) => {
      const path = `/api/organizations/${orgId}`;
      return request<any>(baseUrl, path, { token });
    },

    updateOrganization: async (orgId, payload) => {
      const path = `/api/organizations/${orgId}`;
      return request<any>(baseUrl, path, { method: "PUT", body: payload, token });
    },

    listLocations: async (orgId) => {
      const path = `/api/organizations/${orgId}/locations`;
      return request<any[]>(baseUrl, path, { token });
    },
  };
};

// New: fetch organizations directly from OMS endpoint with optional query params
export const fetchOrganizationsFromOms = async (
  params?: { page?: number; size?: number; sortBy?: string; sortOrder?: "asc" | "desc"; q?: string },
  token?: string
): Promise<any> => {
  const envBase = (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_OMS_BASE_URL)
    ? String((import.meta as any).env.VITE_OMS_BASE_URL)
    : undefined;
  const baseOms = envBase || "http://localhost:9003";

  const qs = new URLSearchParams();
  if (params?.page !== undefined) qs.set("page", String(params.page));
  if (params?.size !== undefined) qs.set("size", String(params.size));
  if (params?.sortBy) qs.set("sortBy", params.sortBy);
  if (params?.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params?.q) qs.set("q", params.q);

  const path = `/dsadmin/dac/organizations${qs.toString() ? `?${qs.toString()}` : ""}`;
  return request<any>(baseOms, path, { token });
};

// New: fetch single organization details from CMS/DS admin by orgId
export const getOrgByOrgId = async (orgId: Id, token?: string): Promise<any | null> => {
  const envBase = (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_OMS_BASE_URL)
    ? String((import.meta as any).env.VITE_OMS_BASE_URL)
    : undefined;
  const baseOms = envBase || "http://localhost:9003";
  const path = `/dsadmin/dac/organizations/${orgId}`;

  const res = await request<any>(baseOms, path, { token });
  if (res == null) return null;

  // normalize: some APIs return { content: [...] } while others return an object
  if (res && Array.isArray((res as any).content)) {
    return (res as any).content[0] ?? null;
  }
  return res;
};

// New: fetch screens for a specific organization from CMS (normalizes array or { content: [...] })
export const fetchScreensForOrg = async (orgId: Id, token?: string): Promise<any[]> => {
  const envBase = (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_CMS_BASE_URL)
    ? String((import.meta as any).env.VITE_CMS_BASE_URL)
    : undefined;
  const baseCms = envBase || "http://localhost:9002/cms";
  const path = `/dsadmin/dac/organizations/${orgId}/screens`;

  const res = await request<any>(baseCms, path, { token });
  if (Array.isArray(res)) return res;
  if (res && Array.isArray((res as any).content)) return (res as any).content;
  return [];
};

// New: fetch playlists for a specific organization from CMS (normalizes array or { content: [...] })
export const fetchPlaylistsForOrg = async (orgId: Id, token?: string): Promise<any[]> => {
  const envBase = (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_CMS_BASE_URL)
    ? String((import.meta as any).env.VITE_CMS_BASE_URL)
    : undefined;
  const baseCms = envBase || "http://localhost:9002/cms";
  const path = `/dsadmin/dac/organizations/${orgId}/playlists`;

  const res = await request<any>(baseCms, path, { token });
  if (Array.isArray(res)) return res;
  if (res && Array.isArray((res as any).content)) return (res as any).content;
  return [];
};

// New: fetch schedules for a specific organization from CMS (normalizes array or { content: [...] })
export const fetchSchedulesForOrg = async (orgId: Id, token?: string): Promise<any[]> => {
  const envBase = (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_CMS_BASE_URL)
    ? String((import.meta as any).env.VITE_CMS_BASE_URL)
    : undefined;
  const baseCms = envBase || "http://localhost:9002/cms";
  const path = `/dsadmin/dac/organizations/${orgId}/schedules`;

  const res = await request<any>(baseCms, path, { token });
  if (Array.isArray(res)) return res;
  if (res && Array.isArray((res as any).content)) return (res as any).content;
  return [];
};

// New: fetch users for a specific organization from CMS (normalizes array or { content: [...] })
export const fetchUsersForOrg = async (orgId: Id, token?: string): Promise<any[]> => {
  const envBase = (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_UMS_BASE_URL)
    ? String((import.meta as any).env.VITE_UMS_BASE_URL)
    : undefined;
  const baseUms = envBase || "http://localhost:9001/ums";
  const path = `/dsadmin/dac/organizations/${orgId}/users`;

  const res = await request<any>(baseUms, path, { token });
  if (Array.isArray(res)) return res;
  if (res && Array.isArray((res as any).content)) return (res as any).content;
  return [];
};

// New: fetch signed-up users (global) from UMS/DS admin
export const fetchSignedUpUsers = async (
  params?: { page?: number; size?: number; sortBy?: string; sortOrder?: "asc" | "desc"; q?: string },
  token?: string
): Promise<any[]> => {
  const envBase = (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_UMS_BASE_URL)
    ? String((import.meta as any).env.VITE_UMS_BASE_URL)
    : undefined;
  const baseUms = envBase || "http://localhost:9001/ums";

  const qs = new URLSearchParams();
  if (params?.page !== undefined) qs.set("page", String(params.page));
  if (params?.size !== undefined) qs.set("size", String(params.size));
  if (params?.sortBy) qs.set("sortBy", params.sortBy);
  if (params?.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params?.q) qs.set("q", params.q);
  // Always filter for signed up users
  qs.set("status", "SIGNED_UP");

  const path = `/dsadmin/dac/users${qs.toString() ? `?${qs.toString()}` : ""}`;

  const res = await request<any>(baseUms, path, { token });
  return res;
};

// New: fetch all screens from CMS with pagination
export const fetchAllScreens = async (
  params?: { page?: number; size?: number; sortBy?: string; sortOrder?: "asc" | "desc"; pairStatus?: string; q?: string },
  token?: string
): Promise<any> => {
  const envBase = (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_CMS_BASE_URL)
    ? String((import.meta as any).env.VITE_CMS_BASE_URL)
    : undefined;
  const baseCms = envBase || "http://localhost:9002/cms";

  const qs = new URLSearchParams();
  if (params?.page !== undefined) qs.set("page", String(params.page));
  if (params?.size !== undefined) qs.set("size", String(params.size));
  if (params?.sortBy) qs.set("sortBy", params.sortBy);
  if (params?.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params?.q) qs.set("q", params.q);
  if (params?.pairStatus) qs.set("pairStatus", params.pairStatus);

  const path = `/dsadmin/dac/screens${qs.toString() ? `?${qs.toString()}` : ""}`;
  return request<any>(baseCms, path, { token });
};

export const fetchScreenStatus = async (screenId: Id, token?: string): Promise<any> => {
  const envBase = (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_CMS_BASE_URL)
    ? String((import.meta as any).env.VITE_CMS_BASE_URL)
    : undefined;
  const baseCms = envBase || "http://localhost:9002/cms";
  const path = `/dsadmin/dac/screens/${screenId}/status`;

  // Expecting an object like { status: "ONLINE" } or { online: true } — caller will normalize
  return request<any>(baseCms, path, { token });
};

// New: fetch runtime status for multiple screens by comma-separated ids
export const fetchScreenStatusByIds = async (ids: string | Id[], token?: string): Promise<any> => {
  const envBase = (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_SMS_BASE_URL)
    ? String((import.meta as any).env.VITE_SMS_BASE_URL)
    : undefined;
  const baseClient = envBase || "http://localhost:9006";

  const idsStr = Array.isArray(ids) ? ids.join(",") : String(ids);
  const path = `/client-status/v2/${idsStr}`;

  return request<any>(baseClient, path, { token });
};

export const fetchConnectedScreens = async (token?: string): Promise<any> => {
  const envBase = (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_SMS_BASE_URL)
    ? String((import.meta as any).env.VITE_SMS_BASE_URL)
    : undefined;
  const baseClient = envBase || "http://localhost:9006";

  const path = `/connected-dshub-players`;

  return request<any>(baseClient, path, { token });
};