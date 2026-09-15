import { Badge } from "@/components/ui/badge";
import {
  COMMUNITY_TYPE_LABELS,
  type CommunityType,
} from "@/lib/validations/community";
import {
  Building2,
  Users,
  Lock,
  Globe,
  Crown,
  Shield,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import type { Database } from "@/lib/types/database.types";

type Community = Database["public"]["Tables"]["communities"]["Row"];

interface CommunityHeaderProps {
  community: Community;
  userRole: "member" | "moderator" | "admin" | "owner";
  memberCount: number;
}

export function CommunityHeader({
  community,
  userRole,
  memberCount,
}: CommunityHeaderProps) {
  const typeLabel =
    COMMUNITY_TYPE_LABELS[community.type as CommunityType] ?? community.type;

  const roleConfig = {
    owner: {
      label: "Owner",
      icon: Crown,
      variant: "primary" as const,
    },
    admin: {
      label: "Admin",
      icon: Shield,
      variant: "primary" as const,
    },
    moderator: {
      label: "Moderator",
      icon: ShieldCheck,
      variant: "default" as const,
    },
    member: {
      label: "Member",
      icon: UserCheck,
      variant: "default" as const,
    },
  }[userRole];

  const RoleIcon = roleConfig.icon;

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Title & Metadata */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-neutral-900)]">
              {community.name}
            </h1>

            {/* Type badge */}
            <Badge variant="default" className="text-xs">
              <Building2 className="mr-1 h-3 w-3" />
              {typeLabel}
            </Badge>

            {/* Privacy badge */}
            {community.is_private ? (
              <Badge variant="outline" className="text-xs">
                <Lock className="mr-1 h-3 w-3 text-[var(--color-neutral-500)]" />
                Private
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <Globe className="mr-1 h-3 w-3 text-[var(--color-neutral-500)]" />
                Public
              </Badge>
            )}
          </div>

          {/* Description */}
          {community.description ? (
            <p className="text-sm text-[var(--color-neutral-600)] leading-relaxed max-w-2xl">
              {community.description}
            </p>
          ) : (
            <p className="text-sm italic text-[var(--color-neutral-400)]">
              No description provided.
            </p>
          )}
        </div>

        {/* Stats & User Role */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--color-neutral-100)]">
          {/* Member Count */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-neutral-600)]">
            <Users className="h-4 w-4 text-[var(--color-neutral-400)]" />
            <span className="font-semibold text-[var(--color-neutral-900)]">
              {memberCount}
            </span>{" "}
            {memberCount === 1 ? "member" : "members"}
          </div>

          {/* User's Role in Community */}
          <Badge variant={roleConfig.variant} className="text-xs">
            <RoleIcon className="mr-1 h-3 w-3" />
            {roleConfig.label}
          </Badge>
        </div>
      </div>
    </div>
  );
}
