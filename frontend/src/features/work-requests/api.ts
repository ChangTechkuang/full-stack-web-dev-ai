import { apiRequest, apiRequestPaged } from "@/shared/api/client";
import type { ApiMeta } from "@/shared/api/types";
import type { Priority, RequestStatus, WorkRequest } from "@/entities/work-request/types";

export interface ListFilters {
  status?: RequestStatus;
  priority?: Priority;
  assigneeId?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreateWorkRequestPayload {
  title: string;
  description?: string;
  priority?: Priority;
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateWorkRequestPayload {
  title?: string;
  description?: string;
  priority?: Priority;
  assigneeId?: string;
  dueDate?: string;
}

export interface ListResult {
  items: WorkRequest[];
  meta?: ApiMeta;
}

export const workRequestsApi = {
  async list(filters: ListFilters = {}): Promise<ListResult> {
    const { page = 0, size = 10, sort = "createdAt,desc", ...rest } = filters;
    const { data, meta } = await apiRequestPaged<WorkRequest[]>("/api/v1/work-requests", {
      method: "GET",
      query: { page, size, sort, ...rest },
    });
    return { items: data, meta };
  },

  get: (id: string) => apiRequest<WorkRequest>(`/api/v1/work-requests/${id}`, { method: "GET" }),

  create: (payload: CreateWorkRequestPayload) =>
    apiRequest<WorkRequest>("/api/v1/work-requests", { method: "POST", body: payload }),

  update: (id: string, payload: UpdateWorkRequestPayload) =>
    apiRequest<WorkRequest>(`/api/v1/work-requests/${id}`, { method: "PUT", body: payload }),

  changeStatus: (id: string, status: RequestStatus) =>
    apiRequest<WorkRequest>(`/api/v1/work-requests/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),

  remove: (id: string) =>
    apiRequest<void>(`/api/v1/work-requests/${id}`, { method: "DELETE" }),
};
