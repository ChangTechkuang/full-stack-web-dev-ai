"use client";

import * as React from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { ApiException } from "@/shared/api/types";
import { PRIORITIES, type Priority, type WorkRequest } from "@/entities/work-request/types";
import { useUpdateWorkRequest } from "../hooks";

interface Props {
  request: WorkRequest;
  canReassign: boolean;
  onCancel: () => void;
  onSaved: () => void;
}

export function EditWorkRequestForm({ request, canReassign, onCancel, onSaved }: Props) {
  const update = useUpdateWorkRequest(request.id);
  const [title, setTitle] = React.useState(request.title);
  const [description, setDescription] = React.useState(request.description ?? "");
  const [priority, setPriority] = React.useState<Priority>(request.priority);
  const [assigneeId, setAssigneeId] = React.useState(request.assignee?.id ?? "");
  const [dueDate, setDueDate] = React.useState(request.dueDate ?? "");
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await update.mutateAsync({
        title,
        description,
        priority,
        assigneeId: canReassign ? assigneeId || undefined : undefined,
        dueDate: dueDate || undefined,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "Failed to update request");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={5}
          maxLength={5000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="priority">Priority</Label>
          <Select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Due date</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>
      {canReassign ? (
        <div className="space-y-1.5">
          <Label htmlFor="assigneeId">Assignee (UUID)</Label>
          <Input
            id="assigneeId"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          />
        </div>
      ) : null}
      {error ? <p className="text-sm text-state-error">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={update.isPending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
