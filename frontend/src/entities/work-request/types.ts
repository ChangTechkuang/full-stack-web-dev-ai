import type { User } from "@/entities/user/types";

export type RequestStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "REJECTED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export const REQUEST_STATUSES: RequestStatus[] = ["PENDING", "IN_PROGRESS", "DONE", "REJECTED"];
export const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export interface WorkRequest {
  id: string;
  title: string;
  description?: string | null;
  status: RequestStatus;
  priority: Priority;
  requester: User;
  assignee?: User | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  PENDING: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["DONE", "REJECTED"],
  DONE: [],
  REJECTED: [],
};

export function nextAllowedStatuses(current: RequestStatus): RequestStatus[] {
  return ALLOWED_TRANSITIONS[current];
}
