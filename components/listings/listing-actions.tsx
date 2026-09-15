"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  pauseListing,
  resumeListing,
  markListingUnavailable,
  archiveListing,
} from "@/lib/actions/listings";
import { Button } from "@/components/ui/button";
import {
  PauseCircle,
  PlayCircle,
  AlertCircle,
  Archive,
  Loader2,
} from "lucide-react";
import type { ListingStatus } from "@/lib/validations/listing";

interface ListingActionsProps {
  listingId: string;
  currentStatus: ListingStatus;
  canManage: boolean;
}

export function ListingActions({
  listingId,
  currentStatus,
  canManage,
}: ListingActionsProps) {
  const [isPending, startTransition] = useTransition();

  if (!canManage || currentStatus === "archived") {
    return null;
  }

  const handleAction = (
    actionFn: (id: string) => Promise<{ success?: boolean; error?: string }>,
    successMessage: string
  ) => {
    startTransition(async () => {
      const res = await actionFn(listingId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(successMessage);
      }
    });
  };

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-[var(--color-neutral-900)]">
        Listing Controls
      </h3>
      <p className="text-xs text-[var(--color-neutral-500)]">
        Control whether this offering is visible to neighbors or temporarily paused.
      </p>

      <div className="flex flex-wrap items-center gap-2.5">
        {currentStatus === "active" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => handleAction(pauseListing, "Listing has been paused.")}
            className="flex items-center gap-1.5"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PauseCircle className="h-3.5 w-3.5" />
            )}
            Pause Listing
          </Button>
        )}

        {(currentStatus === "paused" || currentStatus === "unavailable") && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isPending}
            onClick={() => handleAction(resumeListing, "Listing is now active!")}
            className="flex items-center gap-1.5"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PlayCircle className="h-3.5 w-3.5" />
            )}
            Resume / Make Active
          </Button>
        )}

        {currentStatus === "active" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() =>
              handleAction(markListingUnavailable, "Listing marked as unavailable.")
            }
            className="flex items-center gap-1.5"
          >
            <AlertCircle className="h-3.5 w-3.5 text-[var(--color-warning)]" />
            Mark Unavailable
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => {
            if (window.confirm("Are you sure you want to archive this listing?")) {
              handleAction(archiveListing, "Listing archived.");
            }
          }}
          className="flex items-center gap-1.5 text-[hsl(0,65%,45%)] hover:bg-[hsl(0,70%,97%)] hover:border-[hsl(0,70%,80%)]"
        >
          <Archive className="h-3.5 w-3.5" />
          Archive
        </Button>
      </div>
    </div>
  );
}
