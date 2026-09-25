import { cn } from "@/lib/utils/cn";

/**
 * HandoverLoader — two neighbours tossing a parcel back and forth.
 * Pure CSS, so it works in server-rendered loading.tsx boundaries.
 */
export function HandoverLoader({ label = "Asking your neighbours…", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("handover-loader", className)} role="status" aria-live="polite">
      <div className="handover-loader__stage" aria-hidden="true">
        <span className="handover-loader__nb handover-loader__nb--a" />
        <span className="handover-loader__arc" />
        <span className="handover-loader__parcel" />
        <span className="handover-loader__nb handover-loader__nb--b" />
      </div>
      <p className="handover-loader__label">{label}</p>
    </div>
  );
}
