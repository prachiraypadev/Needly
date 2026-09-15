import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)]",
        primary:
          "border border-transparent bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-semibold",
        outline:
          "border border-[var(--color-neutral-300)] text-[var(--color-neutral-700)] bg-white",
        success:
          "border border-transparent bg-[var(--color-success-light)] text-[var(--color-success)] font-semibold",
        warning:
          "border border-transparent bg-[var(--color-warning-light)] text-[var(--color-warning)] font-semibold",
        error:
          "border border-transparent bg-[var(--color-error-light)] text-[var(--color-error)] font-semibold",
        // Need Type Variants
        borrow:
          "border border-transparent bg-[var(--color-need-borrow-bg)] text-[var(--color-need-borrow)] font-semibold",
        rent:
          "border border-transparent bg-[var(--color-need-rent-bg)] text-[var(--color-need-rent)] font-semibold",
        buy:
          "border border-transparent bg-[var(--color-need-buy-bg)] text-[var(--color-need-buy)] font-semibold",
        service:
          "border border-transparent bg-[var(--color-need-service-bg)] text-[var(--color-need-service)] font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
