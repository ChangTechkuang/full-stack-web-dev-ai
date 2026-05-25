"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select } from "@/shared/ui/select";
import { PRIORITIES, REQUEST_STATUSES, type Priority, type RequestStatus } from "@/entities/work-request/types";

interface FiltersValue {
  status?: RequestStatus;
  priority?: Priority;
  search?: string;
  assigneeId?: string;
}

interface FiltersProps {
  value: FiltersValue;
  onChange: (value: FiltersValue) => void;
}

export function Filters({ value, onChange }: FiltersProps) {
  const [search, setSearch] = React.useState(value.search ?? "");

  React.useEffect(() => {
    const t = setTimeout(() => onChange({ ...value, search: search || undefined }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1.5">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
          <Input
            id="search"
            placeholder="Title or description"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <Select
          id="status"
          value={value.status ?? ""}
          onChange={(e) =>
            onChange({ ...value, status: (e.target.value || undefined) as RequestStatus | undefined })
          }
        >
          <option value="">All statuses</option>
          {REQUEST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="priority">Priority</Label>
        <Select
          id="priority"
          value={value.priority ?? ""}
          onChange={(e) =>
            onChange({ ...value, priority: (e.target.value || undefined) as Priority | undefined })
          }
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="assigneeId">Assignee (id)</Label>
        <Input
          id="assigneeId"
          placeholder="UUID"
          value={value.assigneeId ?? ""}
          onChange={(e) => onChange({ ...value, assigneeId: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}
