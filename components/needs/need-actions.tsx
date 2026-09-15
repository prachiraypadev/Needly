"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { markNeedFulfilled, cancelNeed } from "@/lib/actions/needs";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface NeedActionsProps {
  needId: string;
  currentStatus: string;
  isOwner: boolean;
  canManage: boolean;
}

export function NeedActions({
  needId,
  currentStatus,
  canManage,
}: NeedActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [notes, setNotes] = useState("");

  if (!canManage || currentStatus === "fulfilled" || currentStatus === "cancelled") {
    return null;
  }

  const handleFulfill = () => {
    startTransition(async () => {
      const res = await markNeedFulfilled(needId, notes);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Need marked as fulfilled!");
        setShowNotesDialog(false);
      }
    });
  };

  const handleCancel = () => {
    if (!window.confirm("Are you sure you want to cancel this need?")) {
      return;
    }
    startTransition(async () => {
      const res = await cancelNeed(needId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Need has been cancelled.");
      }
    });
  };

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-[var(--color-neutral-900)]">
        Manage Your Need
      </h3>
      <p className="text-xs text-[var(--color-neutral-500)]">
        Did a neighbor help you with this? Mark it as fulfilled or close the request when no longer needed.
      </p>

      {showNotesDialog ? (
        <div className="space-y-3 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3.5">
          <label
            htmlFor="fulfillment-notes"
            className="block text-xs font-medium text-[var(--color-neutral-800)]"
          >
            Fulfillment Notes (Optional)
          </label>
          <input
            id="fulfillment-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Borrowed from Rahul in Flat 402"
            className="w-full rounded-md border border-[var(--color-neutral-300)] bg-white py-1.5 px-3 text-xs text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setShowNotesDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isPending}
              onClick={handleFulfill}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                "Confirm Fulfilled"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isPending}
            onClick={() => setShowNotesDialog(true)}
            className="flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark as Fulfilled
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={handleCancel}
            className="flex items-center gap-1.5 text-[hsl(0,65%,45%)] hover:bg-[hsl(0,70%,97%)] hover:border-[hsl(0,70%,80%)]"
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancel Need
          </Button>
        </div>
      )}
    </div>
  );
}
