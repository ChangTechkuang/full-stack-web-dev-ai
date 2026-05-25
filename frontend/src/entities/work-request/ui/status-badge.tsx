import { Badge } from "@/shared/ui/badge";
import type { RequestStatus } from "../types";

const labels: Record<RequestStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  REJECTED: "Rejected",
};

const tones: Record<RequestStatus, "warning" | "info" | "success" | "danger"> = {
  PENDING: "warning",
  IN_PROGRESS: "info",
  DONE: "success",
  REJECTED: "danger",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return <Badge tone={tones[status]}>{labels[status]}</Badge>;
}
