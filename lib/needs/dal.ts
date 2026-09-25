import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database.types";
import type { NeedType, NeedStatus } from "@/lib/validations/need";

export type NeedRow = Database["public"]["Tables"]["needs"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export type NeedFeedItem = {
  id: string;
  communityId: string;
  communityName: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string | null;
  title: string;
  description: string | null;
  needType: NeedType;
  budgetMin: number | null;
  budgetMax: number | null;
  quantity: number;
  neededFrom: string | null;
  neededUntil: string | null;
  status: NeedStatus;
  createdAt: string;
  categoryName: string | null;
  isOwner: boolean;
};

export type OfferDetailView = {
  id: string;
  needId: string;
  providerId: string;
  providerName: string;
  providerAvatar: string | null;
  message: string | null;
  priceAmount: number | null;
  availableFrom: string | null;
  availableUntil: string | null;
  status: "pending" | "accepted" | "rejected" | "withdrawn" | "expired";
  createdAt: string;
  isMyOffer: boolean;
};

export type TransactionDetailView = {
  id: string;
  status: "requested" | "accepted" | "confirmed" | "scheduled" | "in_progress" | "completed" | "cancelled" | "disputed";
  agreedAmount: number | null;
  currency: string;
  providerId: string;
  providerName: string;
  providerAvatar: string | null;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type NeedDetailView = {
  need: NeedRow;
  community: {
    id: string;
    name: string;
    slug: string;
  };
  requester: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    createdAt: string;
  };
  category: CategoryRow | null;
  media: Array<{
    id: string;
    url: string;
    mimeType: string | null;
  }>;
  isOwner: boolean;
  canManage: boolean;
  offers: OfferDetailView[];
  myOffer: OfferDetailView | null;
  activeTransaction: TransactionDetailView | null;
};

/**
 * Resolves and verifies the active community for a user.
 * If requestedCommunityId is provided, verifies user is an active member.
 * If not provided or invalid, falls back to the user's first joined community.
 */
export const resolveActiveCommunity = cache(
  async (
    userId: string,
    requestedCommunityId?: string
  ): Promise<{ id: string; name: string; slug: string } | null> => {
    const supabase = await createClient();

    // If specific community was requested, check membership
    if (requestedCommunityId) {
      const { data: membership } = await supabase
        .from("community_members")
        .select(`
          community_id,
          communities (
            id,
            name,
            slug,
            archived_at
          )
        `)
        .eq("community_id", requestedCommunityId)
        .eq("user_id", userId)
        .single();

      const comm = membership?.communities as unknown as {
        id: string;
        name: string;
        slug: string;
        archived_at: string | null;
      } | null;

      if (comm && !comm.archived_at) {
        return {
          id: comm.id,
          name: comm.name,
          slug: comm.slug,
        };
      }
    }

    // Fallback: get user's first active community
    const { data: firstMembership } = await supabase
      .from("community_members")
      .select(`
        community_id,
        communities (
          id,
          name,
          slug,
          archived_at
        )
      `)
      .eq("user_id", userId)
      .limit(1)
      .single();

    const firstComm = firstMembership?.communities as unknown as {
      id: string;
      name: string;
      slug: string;
      archived_at: string | null;
    } | null;

    if (firstComm && !firstComm.archived_at) {
      return {
        id: firstComm.id,
        name: firstComm.name,
        slug: firstComm.slug,
      };
    }

    return null;
  }
);

/**
 * Fetches the need feed STRICTLY SCOPED to the specified active community.
 * Verifies that the querying user is a member of the community.
 */
export const getCommunityNeedsFeed = cache(
  async (
    communityId: string,
    userId: string,
    filterType?: NeedType
  ): Promise<NeedFeedItem[]> => {
    const supabase = await createClient();

    // Verify caller membership in the community
    const { data: isMember } = await supabase
      .from("community_members")
      .select("id")
      .eq("community_id", communityId)
      .eq("user_id", userId)
      .single();

    if (!isMember) {
      return [];
    }

    let query = supabase
      .from("needs")
      .select(`
        id,
        community_id,
        requester_id,
        title,
        description,
        need_type,
        budget_min,
        budget_max,
        quantity,
        needed_from,
        needed_until,
        status,
        created_at,
        communities (
          name
        ),
        profiles (
          display_name,
          avatar_url
        ),
        categories (
          name
        )
      `)
      .eq("community_id", communityId)
      .in("status", ["open", "in_progress"])
      .order("created_at", { ascending: false });

    if (filterType) {
      query = query.eq("need_type", filterType);
    }

    const { data: needs, error } = await query;

    if (error || !needs) {
      return [];
    }

    return needs.map((n) => {
      const comm = n.communities as unknown as { name: string } | null;
      const prof = n.profiles as unknown as {
        display_name: string;
        avatar_url: string | null;
      } | null;
      const cat = n.categories as unknown as { name: string } | null;

      return {
        id: n.id,
        communityId: n.community_id,
        communityName: comm?.name ?? "Community",
        requesterId: n.requester_id,
        requesterName: prof?.display_name ?? "Neighbor",
        requesterAvatar: prof?.avatar_url ?? null,
        title: n.title,
        description: n.description,
        needType: n.need_type as NeedType,
        budgetMin: n.budget_min != null ? Number(n.budget_min) : null,
        budgetMax: n.budget_max != null ? Number(n.budget_max) : null,
        quantity: n.quantity,
        neededFrom: n.needed_from,
        neededUntil: n.needed_until,
        status: n.status as NeedStatus,
        createdAt: n.created_at,
        categoryName: cat?.name ?? null,
        isOwner: n.requester_id === userId,
      };
    });
  }
);

/**
 * Fetches all needs created by a specific user across all communities (personal activity view).
 */
export const getUserNeeds = cache(
  async (userId: string): Promise<NeedFeedItem[]> => {
    const supabase = await createClient();

    const { data: needs, error } = await supabase
      .from("needs")
      .select(`
        id,
        community_id,
        requester_id,
        title,
        description,
        need_type,
        budget_min,
        budget_max,
        quantity,
        needed_from,
        needed_until,
        status,
        created_at,
        communities (
          name
        ),
        profiles (
          display_name,
          avatar_url
        ),
        categories (
          name
        )
      `)
      .eq("requester_id", userId)
      .order("created_at", { ascending: false });

    if (error || !needs) {
      return [];
    }

    return needs.map((n) => {
      const comm = n.communities as unknown as { name: string } | null;
      const prof = n.profiles as unknown as {
        display_name: string;
        avatar_url: string | null;
      } | null;
      const cat = n.categories as unknown as { name: string } | null;

      return {
        id: n.id,
        communityId: n.community_id,
        communityName: comm?.name ?? "Community",
        requesterId: n.requester_id,
        requesterName: prof?.display_name ?? "You",
        requesterAvatar: prof?.avatar_url ?? null,
        title: n.title,
        description: n.description,
        needType: n.need_type as NeedType,
        budgetMin: n.budget_min != null ? Number(n.budget_min) : null,
        budgetMax: n.budget_max != null ? Number(n.budget_max) : null,
        quantity: n.quantity,
        neededFrom: n.needed_from,
        neededUntil: n.needed_until,
        status: n.status as NeedStatus,
        createdAt: n.created_at,
        categoryName: cat?.name ?? null,
        isOwner: true,
      };
    });
  }
);

/**
 * Fetches complete details of a single need.
 * Authoritatively verifies that the user is an active member of the need's community.
 */
export const getNeedDetail = cache(
  async (needId: string, userId: string): Promise<NeedDetailView | null> => {
    const supabase = await createClient();

    // 1. Fetch the need with associated community, requester profile, and category
    const { data: need, error: needError } = await supabase
      .from("needs")
      .select(`
        *,
        communities (
          id,
          name,
          slug,
          archived_at
        ),
        profiles (
          id,
          display_name,
          avatar_url,
          created_at
        ),
        categories (
          id,
          name,
          slug,
          icon
        )
      `)
      .eq("id", needId)
      .single();

    if (needError || !need) {
      return null;
    }

    const community = need.communities as unknown as {
      id: string;
      name: string;
      slug: string;
      archived_at: string | null;
    };

    if (!community || community.archived_at) {
      return null;
    }

    // 2. Authoritative check: Verify that caller is a member of the community
    const { data: membership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", community.id)
      .eq("user_id", userId)
      .single();

    if (!membership) {
      return null;
    }

    // 3. Fetch any associated media items
    const { data: mediaItems } = await supabase
      .from("need_media")
      .select("id, url, mime_type")
      .eq("need_id", needId)
      .order("sort_order", { ascending: true });

    const requester = need.profiles as unknown as {
      id: string;
      display_name: string;
      avatar_url: string | null;
      created_at: string;
    };

    const isOwner = need.requester_id === userId;
    const canManage =
      isOwner || membership.role === "admin" || membership.role === "owner";

    // 4. Fetch Offers (if manager/owner -> all offers; if neighbor -> their own offer)
    let rawOffers: any[] = [];
    if (canManage) {
      const { data } = await supabase
        .from("offers")
        .select(`
          id,
          need_id,
          listing_id,
          provider_id,
          community_id,
          message,
          price_amount,
          available_from,
          available_until,
          status,
          expires_at,
          created_at,
          updated_at,
          profiles (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq("need_id", needId)
        .order("created_at", { ascending: false });
      rawOffers = data || [];
    } else {
      const { data } = await supabase
        .from("offers")
        .select(`
          id,
          need_id,
          listing_id,
          provider_id,
          community_id,
          message,
          price_amount,
          available_from,
          available_until,
          status,
          expires_at,
          created_at,
          updated_at,
          profiles (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq("need_id", needId)
        .eq("provider_id", userId)
        .order("created_at", { ascending: false });
      rawOffers = data || [];
    }

    const offers: OfferDetailView[] = rawOffers.map((o) => {
      const prof = o.profiles as unknown as {
        id: string;
        display_name: string;
        avatar_url: string | null;
      } | null;
      return {
        id: o.id,
        needId: o.need_id,
        providerId: o.provider_id,
        providerName: prof?.display_name ?? "Neighbor",
        providerAvatar: prof?.avatar_url ?? null,
        message: o.message,
        priceAmount: o.price_amount != null ? Number(o.price_amount) : null,
        availableFrom: o.available_from,
        availableUntil: o.available_until,
        status: o.status,
        createdAt: o.created_at,
        isMyOffer: o.provider_id === userId,
      };
    });

    const myOffer = offers.find((o) => o.providerId === userId) || null;

    // 5. Fetch Active Transaction (if need is in_progress or fulfilled)
    let activeTransaction: TransactionDetailView | null = null;
    if (need.status === "in_progress" || need.status === "fulfilled") {
      const { data: tx } = await supabase
        .from("transactions")
        .select(`
          id,
          status,
          agreed_amount,
          currency,
          provider_id,
          requester_id,
          created_at,
          completed_at
        `)
        .eq("need_id", needId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (tx) {
        const { data: participants } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", [tx.requester_id, tx.provider_id]);

        const reqP = participants?.find((p) => p.id === tx.requester_id);
        const provP = participants?.find((p) => p.id === tx.provider_id);

        activeTransaction = {
          id: tx.id,
          status: tx.status as any,
          agreedAmount: tx.agreed_amount != null ? Number(tx.agreed_amount) : null,
          currency: tx.currency ?? "INR",
          providerId: tx.provider_id,
          providerName: provP?.display_name ?? "Neighbor",
          providerAvatar: provP?.avatar_url ?? null,
          requesterId: tx.requester_id,
          requesterName: reqP?.display_name ?? "Requester",
          requesterAvatar: reqP?.avatar_url ?? null,
          createdAt: tx.created_at,
          completedAt: tx.completed_at,
        };
      }
    }

    return {
      need: need as unknown as NeedRow,
      community: {
        id: community.id,
        name: community.name,
        slug: community.slug,
      },
      requester: {
        id: requester.id,
        displayName: requester.display_name,
        avatarUrl: requester.avatar_url ?? null,
        createdAt: requester.created_at,
      },
      category: (need.categories as unknown as CategoryRow) ?? null,
      media: (mediaItems ?? []).map((m) => ({
        id: m.id,
        url: m.url,
        mimeType: m.mime_type,
      })),
      isOwner,
      canManage,
      offers,
      myOffer,
      activeTransaction,
    };
  }
);

/**
 * Fetches active categories for need categorization.
 */
export const getCategories = cache(async (): Promise<CategoryRow[]> => {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return categories ?? [];
});
