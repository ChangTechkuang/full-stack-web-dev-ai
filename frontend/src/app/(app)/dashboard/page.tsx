"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Filters } from "@/features/work-requests/ui/filters";
import { useWorkRequestsList } from "@/features/work-requests/hooks";
import { WorkRequestsTable } from "@/widgets/work-requests-table/ui";
import type { Priority, RequestStatus } from "@/entities/work-request/types";

interface FilterState {
  status?: RequestStatus;
  priority?: Priority;
  assigneeId?: string;
  search?: string;
}

export default function DashboardPage() {
  const [filters, setFilters] = React.useState<FilterState>({});
  const [page, setPage] = React.useState(0);

  const query = useWorkRequestsList({ ...filters, page, size: 10 });
  const items = query.data?.items ?? [];
  const meta = query.data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Work Requests</h1>
          <p className="text-sm text-text-secondary">Track, filter, and manage requests.</p>
        </div>
        <Link href="/requests/new">
          <Button>
            <Plus className="size-4" />
            New Request
          </Button>
        </Link>
      </div>

      <Filters
        value={filters}
        onChange={(v) => {
          setFilters(v);
          setPage(0);
        }}
      />

      {query.isError ? (
        <p className="text-sm text-state-error">
          Failed to load requests:{" "}
          {(query.error as Error)?.message ?? "Unknown error"}
        </p>
      ) : null}

      <WorkRequestsTable items={items} loading={query.isLoading} />

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            Page {meta.page + 1} of {meta.totalPages} · {meta.totalElements} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
