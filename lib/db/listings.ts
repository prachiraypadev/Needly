import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database.types";
import type {
  ListingType,
  TransactionType,
  PriceUnit,
  ItemCondition,
  ListingStatus,
} from "@/lib/validations/listing";

export type ListingRow = Database["public"]["Tables"]["listings"]["Row"];
export type ListingMediaRow = Database["public"]["Tables"]["listing_media"]["Row"];
export type ListingAvailabilityRow = Database["public"]["Tables"]["listing_availability"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export type ListingFeedItem = {
  id: string;
  communityId: string;
  communityName: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string | null;
  title: string;
  description: string | null;
  listingType: ListingType;
  transactionType: TransactionType;
  priceAmount: number | null;
  priceUnit: PriceUnit | null;
  quantity: number;
  condition: ItemCondition | null;
  status: ListingStatus;
  createdAt: string;
  categoryName: string | null;
  primaryImageUrl: string | null;
  isOwner: boolean;
};

export type ListingDetailView = {
  listing: ListingRow;
  community: {
    id: string;
    name: string;
    slug: string;
  };
  owner: {
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
    sortOrder: number;
  }>;
  availability: Array<{
    id: string;
    dayOfWeek: number;
    timeFrom: string;
    timeTo: string;
    isAvailable: boolean;
  }>;
  isOwner: boolean;
  canManage: boolean;
};

export type ListingFilters = {
  listingType?: ListingType;
  transactionType?: TransactionType;
  categoryId?: string;
  condition?: ItemCondition;
  maxPrice?: number;
};

/**
 * Fetches listings strictly scoped to the specified active community.
 * Verifies caller is an active member of the community.
 */
export const getCommunityListings = cache(
  async (
    communityId: string,
    userId: string,
    filters?: ListingFilters
  ): Promise<ListingFeedItem[]> => {
    const supabase = await createClient();

    // Verify membership in community
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
      .from("listings")
      .select(`
        id,
        community_id,
        owner_id,
        title,
        description,
        listing_type,
        transaction_type,
        price_amount,
        price_unit,
        quantity,
        condition,
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
        ),
        listing_media (
          url,
          sort_order
        )
      `)
      .eq("community_id", communityId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (filters?.listingType) {
      query = query.eq("listing_type", filters.listingType);
    }
    if (filters?.transactionType) {
      query = query.eq("transaction_type", filters.transactionType);
    }
    if (filters?.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }
    if (filters?.condition) {
      query = query.eq("condition", filters.condition);
    }
    if (filters?.maxPrice != null) {
      query = query.lte("price_amount", filters.maxPrice);
    }

    const { data: listings, error } = await query;

    if (error || !listings) {
      return [];
    }

    return listings.map((l) => {
      const comm = l.communities as unknown as { name: string } | null;
      const prof = l.profiles as unknown as {
        display_name: string;
        avatar_url: string | null;
      } | null;
      const cat = l.categories as unknown as { name: string } | null;
      const mediaList = (l.listing_media as unknown as Array<{
        url: string;
        sort_order: number;
      }>) || [];

      const sortedMedia = [...mediaList].sort(
        (a, b) => a.sort_order - b.sort_order
      );

      return {
        id: l.id,
        communityId: l.community_id,
        communityName: comm?.name ?? "Community",
        ownerId: l.owner_id,
        ownerName: prof?.display_name ?? "Neighbor",
        ownerAvatar: prof?.avatar_url ?? null,
        title: l.title,
        description: l.description,
        listingType: l.listing_type as ListingType,
        transactionType: l.transaction_type as TransactionType,
        priceAmount: l.price_amount != null ? Number(l.price_amount) : null,
        priceUnit: (l.price_unit as PriceUnit) || null,
        quantity: l.quantity,
        condition: (l.condition as ItemCondition) || null,
        status: l.status as ListingStatus,
        createdAt: l.created_at,
        categoryName: cat?.name ?? null,
        primaryImageUrl: sortedMedia[0]?.url ?? null,
        isOwner: l.owner_id === userId,
      };
    });
  }
);

/**
 * Fetches all listings created by the specified user (personal management view).
 */
export const getUserListings = cache(
  async (
    userId: string,
    statusFilter?: ListingStatus
  ): Promise<ListingFeedItem[]> => {
    const supabase = await createClient();

    let query = supabase
      .from("listings")
      .select(`
        id,
        community_id,
        owner_id,
        title,
        description,
        listing_type,
        transaction_type,
        price_amount,
        price_unit,
        quantity,
        condition,
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
        ),
        listing_media (
          url,
          sort_order
        )
      `)
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    } else {
      query = query.neq("status", "archived");
    }

    const { data: listings, error } = await query;

    if (error || !listings) {
      return [];
    }

    return listings.map((l) => {
      const comm = l.communities as unknown as { name: string } | null;
      const prof = l.profiles as unknown as {
        display_name: string;
        avatar_url: string | null;
      } | null;
      const cat = l.categories as unknown as { name: string } | null;
      const mediaList = (l.listing_media as unknown as Array<{
        url: string;
        sort_order: number;
      }>) || [];

      const sortedMedia = [...mediaList].sort(
        (a, b) => a.sort_order - b.sort_order
      );

      return {
        id: l.id,
        communityId: l.community_id,
        communityName: comm?.name ?? "Community",
        ownerId: l.owner_id,
        ownerName: prof?.display_name ?? "You",
        ownerAvatar: prof?.avatar_url ?? null,
        title: l.title,
        description: l.description,
        listingType: l.listing_type as ListingType,
        transactionType: l.transaction_type as TransactionType,
        priceAmount: l.price_amount != null ? Number(l.price_amount) : null,
        priceUnit: (l.price_unit as PriceUnit) || null,
        quantity: l.quantity,
        condition: (l.condition as ItemCondition) || null,
        status: l.status as ListingStatus,
        createdAt: l.created_at,
        categoryName: cat?.name ?? null,
        primaryImageUrl: sortedMedia[0]?.url ?? null,
        isOwner: true,
      };
    });
  }
);

/**
 * Fetches complete details of a single listing.
 * Authoritatively verifies that caller is an active member of the listing's community.
 */
export const getListingById = cache(
  async (listingId: string, userId: string): Promise<ListingDetailView | null> => {
    const supabase = await createClient();

    // 1. Fetch the listing
    const { data: listing, error: listingError } = await supabase
      .from("listings")
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
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return null;
    }

    const community = listing.communities as unknown as {
      id: string;
      name: string;
      slug: string;
      archived_at: string | null;
    };

    if (!community || community.archived_at) {
      return null;
    }

    // 2. Authoritative check: Verify membership in community
    const { data: membership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", community.id)
      .eq("user_id", userId)
      .single();

    if (!membership) {
      return null;
    }

    // 3. Fetch media and availability
    const [mediaRes, availabilityRes] = await Promise.all([
      supabase
        .from("listing_media")
        .select("id, url, mime_type, sort_order")
        .eq("listing_id", listingId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("listing_availability")
        .select("id, day_of_week, time_from, time_to, is_available")
        .eq("listing_id", listingId)
        .order("day_of_week", { ascending: true }),
    ]);

    const owner = listing.profiles as unknown as {
      id: string;
      display_name: string;
      avatar_url: string | null;
      created_at: string;
    };

    const isOwner = listing.owner_id === userId;
    const canManage =
      isOwner || membership.role === "admin" || membership.role === "owner";

    return {
      listing: listing as unknown as ListingRow,
      community: {
        id: community.id,
        name: community.name,
        slug: community.slug,
      },
      owner: {
        id: owner.id,
        displayName: owner.display_name,
        avatarUrl: owner.avatar_url ?? null,
        createdAt: owner.created_at,
      },
      category: (listing.categories as unknown as CategoryRow) ?? null,
      media: (mediaRes.data ?? []).map((m) => ({
        id: m.id,
        url: m.url,
        mimeType: m.mime_type,
        sortOrder: m.sort_order,
      })),
      availability: (availabilityRes.data ?? []).map((a) => ({
        id: a.id,
        dayOfWeek: a.day_of_week,
        timeFrom: a.time_from,
        timeTo: a.time_to,
        isAvailable: a.is_available,
      })),
      isOwner,
      canManage,
    };
  }
);

/**
 * Fetches active categories for listings.
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
