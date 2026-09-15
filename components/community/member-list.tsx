import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { SafeCommunityMember } from "@/lib/community/dal";
import { Users, Crown, Shield, ShieldCheck, UserCheck } from "lucide-react";

interface MemberListProps {
  members: SafeCommunityMember[];
}

export function MemberList({ members }: MemberListProps) {
  const getRoleBadge = (role: SafeCommunityMember["role"]) => {
    switch (role) {
      case "owner":
        return (
          <Badge variant="primary" className="text-[11px] py-0 px-2">
            <Crown className="mr-1 h-3 w-3" />
            Owner
          </Badge>
        );
      case "admin":
        return (
          <Badge variant="primary" className="text-[11px] py-0 px-2">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        );
      case "moderator":
        return (
          <Badge variant="default" className="text-[11px] py-0 px-2">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Moderator
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px] py-0 px-2">
            <UserCheck className="mr-1 h-3 w-3 text-[var(--color-neutral-400)]" />
            Member
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[var(--color-primary-600)]" />
          <h2 className="text-base font-semibold text-[var(--color-neutral-900)]">
            Community Members ({members.length})
          </h2>
        </div>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-[var(--color-neutral-500)] py-4 text-center">
          No members found.
        </p>
      ) : (
        <div className="divide-y divide-[var(--color-neutral-100)]">
          {members.map((member) => {
            const joinedDate = new Date(member.joinedAt).toLocaleDateString(
              "en-IN",
              {
                month: "short",
                year: "numeric",
              }
            );

            return (
              <div
                key={member.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                {/* Member Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={member.displayName} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-neutral-900)] truncate">
                      {member.displayName}
                    </p>
                    <p className="text-xs text-[var(--color-neutral-400)]">
                      Joined {joinedDate}
                    </p>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="shrink-0 ml-3">
                  {getRoleBadge(member.role)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
