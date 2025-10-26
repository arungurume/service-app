// Minimal Canva template + category service (CRUD) — modeled after dshubService

export type Id = number | string;
export type ApiObject = Record<string, any>;

const defaultHeaders = { "Content-Type": "application/json" };

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  token?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

const request = async <T = any>(baseUrl: string, path: string, opts: RequestOptions = {}): Promise<T> => {
  const url = `${baseUrl.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = { ...defaultHeaders, ...(opts.headers || {}) };
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Request failed: ${res.status} ${res.statusText} ${text}`);
    (err as any).status = res.status;
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return (await res.json()) as T;
  // @ts-ignore
  return (await res.text()) as T;
};

// types
export interface CanvaTemplate {
  id?: Id;
  title: string;
  designUrl?: string;
  templateUrl?: string;
  categories?: TemplateCategory[];
  tags?: string[];
  size?: string;
  width?: number;
  height?: number;
  plan?: string;
  previewUrl?: string;
  createdDate?: number;
  updatedDate?: number;
  [k: string]: any;
}

export interface TemplateCategory {
  id?: Id;
  name: string;
  orderNo?: number;
  [k: string]: any;
}

// base URL helper (env var VITE_TMS_BASE_URL)
const getBase = () =>
  (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_TMS_BASE_URL)
    ? String((import.meta as any).env.VITE_TMS_BASE_URL)
    : "http://localhost:9004/canva";

// CRUD functions for templates
export const listTemplates = async (
  params?: { page?: number; size?: number; q?: string; sortBy?: string; sortOrder?: "asc" | "desc"; categoryId?: Id },
  token?: string
): Promise<ApiObject> => {
  const base = getBase();
  const qs = new URLSearchParams();
  if (params?.page !== undefined) qs.set("page", String(params.page));
  if (params?.size !== undefined) qs.set("size", String(params.size));
  if (params?.q) qs.set("q", params.q);
  if (params?.sortBy) qs.set("sortBy", params.sortBy);
  if (params?.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params?.categoryId !== undefined && params.categoryId !== null) qs.set("categoryId", String(params.categoryId));

  const path = `/dsadmin/dactc/templates${qs.toString() ? `?${qs.toString()}` : ""}`;
  return request<ApiObject>(base, path, { token });
};

export const getTemplate = async (templateId: Id, includeCategories = false, token?: string): Promise<CanvaTemplate> => {
  const base = getBase();
  const qs = new URLSearchParams();
  if (includeCategories) qs.set("includeCategories", "true");
  return request<CanvaTemplate>(base, `/dsadmin/dactc/templates/${templateId}?${qs.toString()}`, { token });
};

export const createTemplate = async (payload: Partial<CanvaTemplate>, token?: string): Promise<CanvaTemplate> => {
  const base = getBase();
  return request<CanvaTemplate>(base, `/dsadmin/dactc/templates`, { method: "POST", body: payload, token });
};

export const updateTemplate = async (templateId: Id, payload: Partial<CanvaTemplate>, token?: string): Promise<CanvaTemplate> => {
  const base = getBase();
  return request<CanvaTemplate>(base, `/dsadmin/dactc/templates/${templateId}`, { method: "PUT", body: payload, token });
};

export const deleteTemplate = async (templateId: Id, token?: string): Promise<void> => {
  const base = getBase();
  await request<void>(base, `/dsadmin/dactc/templates/${templateId}`, { method: "DELETE", token });
};

// CRUD for categories
export const listCategories = async (token?: string): Promise<any> => {
  const base = getBase();
  return request<any>(base, `/dsadmin/dactc/categories`, { token });
};

export const getCategory = async (categoryId: Id, token?: string): Promise<TemplateCategory> => {
  const base = getBase();
  return request<TemplateCategory>(base, `/dsadmin/dactc/categories/${categoryId}`, { token });
};

export const createCategory = async (payload: Partial<TemplateCategory>, token?: string): Promise<TemplateCategory> => {
  const base = getBase();
  return request<TemplateCategory>(base, `/dsadmin/dactc/categories`, { method: "POST", body: payload, token });
};

export const updateCategory = async (categoryId: Id, payload: Partial<TemplateCategory>, token?: string): Promise<TemplateCategory> => {
  const base = getBase();
  return request<TemplateCategory>(base, `/dsadmin/dactc/categories/${categoryId}`, { method: "PUT", body: payload, token });
};

export const deleteCategory = async (categoryId: Id, token?: string): Promise<void> => {
  const base = getBase();
  await request<void>(base, `/dsadmin/dactc/categories/${categoryId}`, { method: "DELETE", token });
};

// Factory similar to createDSHubClient
export const createCanvaClient = (token?: string) => ({
  listTemplates: (params?: any) => listTemplates(params, token),
  getTemplate: (id: Id) => getTemplate(id, token),
  createTemplate: (payload: Partial<CanvaTemplate>) => createTemplate(payload, token),
  updateTemplate: (id: Id, payload: Partial<CanvaTemplate>) => updateTemplate(id, payload, token),
  deleteTemplate: (id: Id) => deleteTemplate(id, token),
  listCategories: () => listCategories(token),
  getCategory: (id: Id) => getCategory(id, token),
  createCategory: (payload: Partial<TemplateCategory>) => createCategory(payload, token),
  updateCategory: (id: Id, payload: Partial<TemplateCategory>) => updateCategory(id, payload, token),
  deleteCategory: (id: Id) => deleteCategory(id, token),
});
