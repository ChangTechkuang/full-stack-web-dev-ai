"use client";

import * as React from "react";
import { Button } from "@/shared/ui/button";
import { ApiException } from "@/shared/api/types";
import { nextAllowedStatuses, type RequestStatus, type WorkRequest } from "@/entities/work-request/types";
import { useChangeStatus } from "../hooks";

const labels: Record<RequestStatus, string> = {
  PENDING: "Reopen",
  IN_PROGRESS: "Start",
  DONE: "Mark Done",
  REJECTED: "Reject",
};

export function StatusChanger({ request }: { request: WorkRequest }) {
  const transitions = nextAllowedStatuses(request.status);
  const change = useChangeStatus(request.id);
  const [error, setError] = React.useState<string | null>(null);

  if (transitions.length === 0) {
    return <p className="text-sm text-text-secondary">No further transitions available.</p>;
  }

  const handle = async (target: RequestStatus) => {
    setError(null);
    try {
      await change.mutateAsync(target);
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "Failed to change status");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {transitions.map((target) => (
          <Button
            key={target}
            size="sm"
            variant={target === "REJECTED" ? "danger" : "primary"}
            onClick={() => handle(target)}
            loading={change.isPending && change.variables === target}
          >
            {labels[target]}
          </Button>
        ))}
      </div>
      {error ? <p className="text-sm text-state-error">{error}</p> : null}
    </div>
  );
}
