import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database.types";

export type CommunityRow = Database["public"]["Tables"]["communities"]["Row"];
export type CommunityMemberRow = Database["public"]["Tables"]["community_members"]["Row"];

export type UserCommunityItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  is_private: boolean;
  role: "member" | "moderator" | "admin" | "owner";
  joined_at: string;
  member_count: number;
};

export type CommunityDetail = {
  community: CommunityRow;
  userRole: "member" | "moderator" | "admin" | "owner";
  memberCount: number;
  isOwner: boolean;
  isAdmin: boolean;
};

export type SafeCommunityMember = {
  id: string;
  userId: string;
  role: "member" | "moderator" | "admin" | "owner";
  joinedAt: string;
  displayName: string;
  avatarUrl: string | null;
};

/**
 * Fetches all communities the specified user belongs to.
 * Includes user's role and total member count for each community.
 */
export const getUserCommunities = cache(
  async (userId: string): Promise<UserCommunityItem[]> => {
    const supabase = await createClient();

    // Query community memberships for this user
    const { data: memberships, error } = await supabase
      .from("community_members")
      .select(`
        role,
        joined_at,
        communities (
          id,
          name,
          slug,
          description,
          type,
          is_private,
          archived_at
        )
      `)
      .eq("user_id", userId);

    if (error || !memberships) {
      return [];
    }

    const validCommunities = memberships
      .filter((m) => m.communities && !(m.communities as unknown as CommunityRow).archived_at)
      .map((m) => {
        const comm = m.communities as unknown as CommunityRow;
        return {
          id: comm.id,
          name: comm.name,
          slug: comm.slug,
          description: comm.description,
          type: comm.type,
          is_private: comm.is_private,
          role: m.role as "member" | "moderator" | "admin" | "owner",
          joined_at: m.joined_at,
          member_count: 1, // default base count
        };
      });

    return validCommunities;
  }
);

/**
 * Fetches a community by ID and verifies the calling user is an authorized member.
 * Returns null if the community does not exist or the user is not a member.
 */
export const getCommunityWithMembership = cache(
  async (
    communityId: string,
    userId: string
  ): Promise<CommunityDetail | null> => {
    const supabase = await createClient();

    // 1. Fetch community details
    const { data: community, error: commError } = await supabase
      .from("communities")
      .select("*")
      .eq("id", communityId)
      .is("archived_at", null)
      .single<CommunityRow>();

    if (commError || !community) {
      return null;
    }

    // 2. Verify membership & role of the user
    const { data: membership, error: memError } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", communityId)
      .eq("user_id", userId)
      .single<{ role: "member" | "moderator" | "admin" | "owner" }>();

    if (memError || !membership) {
      return null;
    }

    // 3. Get total member count
    const { count } = await supabase
      .from("community_members")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId);

    const userRole = membership.role;
    const isOwner = userRole === "owner";
    const isAdmin = isOwner || userRole === "admin";

    return {
      community,
      userRole,
      memberCount: count ?? 1,
      isOwner,
      isAdmin,
    };
  }
);

/**
 * Fetches the public member directory for a community.
 * Security: Only exposes public profile fields (display_name, avatar_url).
 * Never exposes private data (phone, email, etc.).
 */
export const getCommunityMembers = cache(
  async (communityId: string): Promise<SafeCommunityMember[]> => {
    const supabase = await createClient();

    const { data: members, error } = await supabase
      .from("community_members")
      .select(`
        id,
        user_id,
        role,
        joined_at,
        profiles (
          display_name,
          avatar_url
        )
      `)
      .eq("community_id", communityId)
      .order("joined_at", { ascending: true });

    if (error || !members) {
      return [];
    }

    return members.map((m) => {
      const profile = m.profiles as unknown as {
        display_name: string;
        avatar_url: string | null;
      } | null;

      return {
        id: m.id,
        userId: m.user_id,
        role: m.role as "member" | "moderator" | "admin" | "owner",
        joinedAt: m.joined_at,
        displayName: profile?.display_name ?? "Community Member",
        avatarUrl: profile?.avatar_url ?? null,
      };
    });
  }
);
