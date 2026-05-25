"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { ApiException } from "@/shared/api/types";
import { formatDate, formatDateTime } from "@/shared/lib/format";
import { useAuth } from "@/features/auth/context";
import { useWorkRequest } from "@/features/work-requests/hooks";
import { EditWorkRequestForm } from "@/features/work-requests/ui/edit-form";
import { StatusChanger } from "@/features/work-requests/ui/status-changer";
import { DeleteRequestButton } from "@/features/work-requests/ui/delete-button";
import { StatusBadge } from "@/entities/work-request/ui/status-badge";
import { PriorityBadge } from "@/entities/work-request/ui/priority-badge";

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user } = useAuth();
  const { data: request, isLoading, isError, error } = useWorkRequest(id);
  const [editing, setEditing] = React.useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !request) {
    const message =
      error instanceof ApiException ? error.message : "Failed to load this request";
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <p className="text-sm text-state-error">{message}</p>
      </div>
    );
  }

  const isManager = user?.role === "MANAGER";
  const isRequester = user?.id === request.requester.id;
  const canEdit = isManager || (isRequester && request.status === "PENDING");
  const canDelete = isManager || (isRequester && request.status === "PENDING");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            Back to list
          </Button>
        </Link>
        <div className="flex gap-2">
          {canEdit && !editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
          ) : null}
          {canDelete ? <DeleteRequestButton id={request.id} /> : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
          </div>
          <CardTitle className="mt-2">{request.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {editing ? (
            <EditWorkRequestForm
              request={request}
              canReassign={isManager}
              onCancel={() => setEditing(false)}
              onSaved={() => setEditing(false)}
            />
          ) : (
            <>
              {request.description ? (
                <p className="whitespace-pre-wrap text-sm text-text-primary">
                  {request.description}
                </p>
              ) : (
                <p className="text-sm text-text-secondary">No description provided.</p>
              )}

              <dl className="grid gap-4 sm:grid-cols-2">
                <Field label="Requester" value={request.requester.fullName} hint={request.requester.email} />
                <Field
                  label="Assignee"
                  value={request.assignee?.fullName ?? "Unassigned"}
                  hint={request.assignee?.email}
                />
                <Field label="Due date" value={formatDate(request.dueDate)} />
                <Field label="Created" value={formatDateTime(request.createdAt)} />
                <Field label="Last updated" value={formatDateTime(request.updatedAt)} />
              </dl>

              {isManager ? (
                <div className="rounded-2xl border border-border-default bg-bg-elevated p-4">
                  <h3 className="mb-3 text-sm font-semibold">Change status</h3>
                  <StatusChanger request={request} />
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-text-secondary">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-text-primary">{value}</dd>
      {hint ? <dd className="text-xs text-text-secondary">{hint}</dd> : null}
    </div>
  );
}
