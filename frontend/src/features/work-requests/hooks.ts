"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  workRequestsApi,
  type CreateWorkRequestPayload,
  type ListFilters,
  type UpdateWorkRequestPayload,
} from "./api";
import type { RequestStatus } from "@/entities/work-request/types";

const keys = {
  all: ["work-requests"] as const,
  list: (filters: ListFilters) => ["work-requests", "list", filters] as const,
  detail: (id: string) => ["work-requests", "detail", id] as const,
};

export function useWorkRequestsList(filters: ListFilters) {
  return useQuery({
    queryKey: keys.list(filters),
    queryFn: () => workRequestsApi.list(filters),
    staleTime: 30_000,
  });
}

export function useWorkRequest(id: string | undefined) {
  return useQuery({
    queryKey: id ? keys.detail(id) : ["work-requests", "detail", "noop"],
    queryFn: () => {
      if (!id) throw new Error("Missing id");
      return workRequestsApi.get(id);
    },
    enabled: Boolean(id),
  });
}

export function useCreateWorkRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkRequestPayload) => workRequestsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateWorkRequest(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateWorkRequestPayload) => workRequestsApi.update(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData(keys.detail(id), updated);
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useChangeStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: RequestStatus) => workRequestsApi.changeStatus(id, status),
    onSuccess: (updated) => {
      qc.setQueryData(keys.detail(id), updated);
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeleteWorkRequest(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => workRequestsApi.remove(id),
    onSuccess: () => {
      qc.removeQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
