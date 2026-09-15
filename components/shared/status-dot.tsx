import React from "react";
import { cn } from "@/lib/utils/cn";

export type StatusDotVariant = "open" | "in_progress" | "fulfilled" | "cancelled" | "pending";

interface StatusDotProps {
  status: StatusDotVariant;
  label?: string;
  className?: string;
}

const colorMap: Record<StatusDotVariant, { dot: string; text: string }> = {
  open: {
    dot: "bg-[var(--color-success)]",
    text: "text-[var(--color-success)]",
  },
  in_progress: {
    dot: "bg-[var(--color-info)]",
    text: "text-[var(--color-info)]",
  },
  fulfilled: {
    dot: "bg-[var(--color-neutral-400)]",
    text: "text-[var(--color-neutral-600)]",
  },
  cancelled: {
    dot: "bg-[var(--color-error)]",
    text: "text-[var(--color-error)]",
  },
  pending: {
    dot: "bg-[var(--color-warning)]",
    text: "text-[var(--color-warning)]",
  },
};

export function StatusDot({ status, label, className }: StatusDotProps) {
  const config = colorMap[status] || colorMap.open;

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <span
        aria-hidden="true"
        className={cn("h-2 w-2 rounded-full ring-2 ring-white/80", config.dot)}
      />
      {label && <span className={config.text}>{label}</span>}
    </span>
  );
}
