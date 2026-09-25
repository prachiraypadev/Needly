"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCommunity } from "@/lib/actions/community";
import { toast } from "sonner";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteCommunityButtonProps {
  communityId: string;
  communityName: string;
  redirectAfter?: boolean;
  variant?: "icon" | "full";
}

export function DeleteCommunityButton({
  communityId,
  communityName,
  redirectAfter = false,
  variant = "icon",
}: DeleteCommunityButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteCommunity(communityId);
        if (result.message) {
          toast.error(result.message);
          return;
        }
        toast.success(`"${communityName}" deleted successfully.`);
        setIsOpen(false);
        if (redirectAfter) {
          router.push("/communities");
        } else {
          router.refresh();
        }
      } catch {
        toast.error("Failed to delete community. Please try again.");
      }
    });
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          title={`Delete ${communityName}`}
          aria-label={`Delete ${communityName}`}
          className="p-1.5 rounded-lg text-[var(--color-neutral-400)] hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Community</span>
        </Button>
      )}

      {/* Confirmation Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={(e) => {
            e.stopPropagation();
            if (!isPending) setIsOpen(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                className="text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)] p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-[var(--color-neutral-900)]">
              Delete &quot;{communityName}&quot;?
            </h3>
            <p className="mt-2 text-sm text-[var(--color-neutral-600)] leading-relaxed">
              Are you sure you want to delete this community? All member associations will be archived and this community will be removed from your dashboard.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Yes, Delete Community"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
