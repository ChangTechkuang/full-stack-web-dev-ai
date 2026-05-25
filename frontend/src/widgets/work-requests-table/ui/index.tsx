"use client";

import Link from "next/link";
import { Calendar, User as UserIcon } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { formatDate } from "@/shared/lib/format";
import { PriorityBadge } from "@/entities/work-request/ui/priority-badge";
import { StatusBadge } from "@/entities/work-request/ui/status-badge";
import type { WorkRequest } from "@/entities/work-request/types";

interface Props {
  items: WorkRequest[];
  loading?: boolean;
}

export function WorkRequestsTable({ items, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No work requests"
        description="Try clearing filters or submit a new request."
      />
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <ul className="divide-y divide-border-default">
        {items.map((wr) => (
          <li key={wr.id}>
            <Link
              href={`/requests/${wr.id}`}
              className="flex flex-col gap-2 p-4 transition-colors hover:bg-bg-subtle sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={wr.status} />
                  <PriorityBadge priority={wr.priority} />
                </div>
                <h3 className="truncate text-sm font-semibold text-text-primary">{wr.title}</h3>
                {wr.description ? (
                  <p className="line-clamp-1 text-sm text-text-secondary">{wr.description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                <span className="inline-flex items-center gap-1">
                  <UserIcon className="size-3.5" />
                  {wr.assignee?.fullName ?? "Unassigned"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {formatDate(wr.dueDate ?? wr.createdAt)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
