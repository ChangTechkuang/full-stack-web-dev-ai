"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { ApiException } from "@/shared/api/types";
import { useDeleteWorkRequest } from "../hooks";

interface Props {
  id: string;
  redirectTo?: string;
}

export function DeleteRequestButton({ id, redirectTo = "/dashboard" }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const remove = useDeleteWorkRequest(id);

  const confirm = async () => {
    setError(null);
    try {
      await remove.mutateAsync();
      setOpen(false);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "Failed to delete");
    }
  };

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" />
        Delete
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete this request?"
        description="This action cannot be undone."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirm} loading={remove.isPending}>
              Delete
            </Button>
          </>
        }
      >
        {error ? <p className="text-sm text-state-error">{error}</p> : null}
      </Dialog>
    </>
  );
}
