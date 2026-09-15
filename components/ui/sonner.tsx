"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[var(--color-neutral-900)] group-[.toaster]:border-[var(--color-neutral-200)] group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:font-sans",
          description: "group-[.toast]:text-[var(--color-neutral-500)] text-xs",
          actionButton:
            "group-[.toast]:bg-[var(--color-primary-500)] group-[.toast]:text-white group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-[var(--color-neutral-100)] group-[.toast]:text-[var(--color-neutral-700)]",
          success:
            "group-[.toaster]:border-[var(--color-success)]/30 group-[.toaster]:text-[var(--color-success)]",
          error:
            "group-[.toaster]:border-[var(--color-error)]/30 group-[.toaster]:text-[var(--color-error)]",
          warning:
            "group-[.toaster]:border-[var(--color-warning)]/30 group-[.toaster]:text-[var(--color-warning)]",
        },
      }}
      position="bottom-right"
      richColors
      closeButton
      {...props}
    />
  );
}
