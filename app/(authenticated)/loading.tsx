import { HandoverLoader } from "@/components/shared/handover-loader";

export default function AuthenticatedLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <HandoverLoader />
    </div>
  );
}
