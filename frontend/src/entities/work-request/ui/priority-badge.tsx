import { Badge } from "@/shared/ui/badge";
import type { Priority } from "../types";

const tones: Record<Priority, "neutral" | "info" | "warning" | "danger"> = {
  LOW: "neutral",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "danger",
};

const labels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge tone={tones[priority]}>{labels[priority]}</Badge>;
}
