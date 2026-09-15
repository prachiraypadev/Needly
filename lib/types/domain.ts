import type { NeedType, NeedStatus } from "@/lib/constants/need-types";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  phone_verified_at?: string | null;
  bio?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CommunityType =
  | "apartment"
  | "gated"
  | "hostel"
  | "college"
  | "university"
  | "office"
  | "family"
  | "other";

export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  type: CommunityType;
  is_private: boolean;
  invite_code?: string | null;
  created_by: string;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type CommunityRole = "member" | "moderator" | "admin" | "owner";

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: CommunityRole;
  joined_at: string;
  invited_by?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  icon?: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Need {
  id: string;
  community_id: string;
  requester_id: string;
  category_id?: string | null;
  title: string;
  description?: string | null;
  need_type: NeedType;
  budget_min?: number | null;
  budget_max?: number | null;
  quantity: number;
  needed_from?: string | null;
  needed_until?: string | null;
  status: NeedStatus;
  expires_at?: string | null;
  fulfillment_notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields for display
  requester?: Profile;
  category?: Category;
  community?: Community;
  offers_count?: number;
}
