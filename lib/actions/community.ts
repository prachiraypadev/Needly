"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/auth/dal";
import {
  CreateCommunitySchema,
  JoinCommunitySchema,
  CreateInviteSchema,
  type CreateCommunityFormState,
  type JoinCommunityFormState,
  type CreateInviteFormState,
} from "@/lib/validations/community";

// ---------------------------------------------------------------------------
// UTILITY HELPERS
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateRandomSuffix(length = 4): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars (0, O, 1, I)
  let code = "NEED-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateInviteToken(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let token = "inv_";
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ---------------------------------------------------------------------------
// CREATE COMMUNITY
// ---------------------------------------------------------------------------

/**
 * Server Action: Create Community
 * Atomically creates a community and adds the creator as owner.
 * Redirects to /communities/[id] on success.
 */
export async function createCommunity(
  _state: CreateCommunityFormState,
  formData: FormData
): Promise<CreateCommunityFormState> {
  // 1. Authentication
  const { userId } = await verifySession();

  // 2. Validation
  const raw = {
    name: formData.get("name"),
    type: formData.get("type"),
    description: formData.get("description"),
    is_private: formData.get("is_private") ?? "true",
  };

  const validated = CreateCommunitySchema.safeParse(raw);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { name, type, description, is_private } = validated.data;

  // 3. Generate clean slug and invite code
  const baseSlug = slugify(name).slice(0, 50) || "community";
  const slug = `${baseSlug}-${generateRandomSuffix(4)}`;
  const inviteCode = generateInviteCode();

  const supabase = await createClient();

  // 4. Atomic Database Operation (RPC)
  let communityId: string | null = null;

  // Try calling the atomic RPC first
  const { data: rpcCommunityId, error: rpcError } = await supabase.rpc(
    "create_community_with_owner",
    {
      p_name: name,
      p_slug: slug,
      p_description: description || "",
      p_type: type,
      p_is_private: is_private,
      p_invite_code: inviteCode,
    }
  );

  if (!rpcError && rpcCommunityId) {
    communityId = rpcCommunityId as string;
  } else {
    // Fallback: If RPC is not present in local environment, execute direct inserts
    const { data: newComm, error: commError } = await supabase
      .from("communities")
      .insert({
        name,
        slug,
        description: description || null,
        type,
        is_private,
        invite_code: inviteCode,
        created_by: userId,
      })
      .select("id")
      .single<{ id: string }>();

    if (commError || !newComm) {
      return {
        message: "Failed to create community. Please check your inputs and try again.",
      };
    }

    communityId = newComm.id;

    // Create owner membership
    const { error: memberError } = await supabase
      .from("community_members")
      .insert({
        community_id: communityId,
        user_id: userId,
        role: "owner",
      });

    if (memberError) {
      // Rollback community creation if membership failed
      await supabase.from("communities").delete().eq("id", communityId);
      return {
        message: "Failed to initialize community ownership. Please try again.",
      };
    }
  }

  // 5. Invalidate paths and redirect
  revalidatePath("/communities");
  redirect(`/communities/${communityId}`);
}

// ---------------------------------------------------------------------------
// JOIN COMMUNITY
// ---------------------------------------------------------------------------

/**
 * Server Action: Join Community by Invite Code
 * Validates general community code or targeted invite token.
 * Prevents duplicate membership and redirects to the community.
 */
export async function joinCommunity(
  _state: JoinCommunityFormState,
  formData: FormData
): Promise<JoinCommunityFormState> {
  // 1. Authentication
  const { userId } = await verifySession();

  // 2. Validation
  const raw = {
    invite_code: formData.get("invite_code"),
  };

  const validated = JoinCommunitySchema.safeParse(raw);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { invite_code } = validated.data;
  const cleanCode = invite_code.trim();

  const supabase = await createClient();

  // 3. Atomic Database Operation (RPC)
  let joinedCommunityId: string | null = null;

  const { data: rpcCommunityId, error: rpcError } = await supabase.rpc(
    "join_community_by_code",
    {
      p_code: cleanCode,
    }
  );

  if (!rpcError && rpcCommunityId) {
    joinedCommunityId = rpcCommunityId as string;
  } else {
    // Fallback: Direct lookup of general code or targeted invite
    // Check general community code
    const { data: generalComm } = await supabase
      .from("communities")
      .select("id")
      .ilike("invite_code", cleanCode)
      .is("archived_at", null)
      .single<{ id: string }>();

    let targetCommunityId = generalComm?.id;
    let targetedInviteId: string | null = null;
    let inviterId: string | null = null;

    if (!targetCommunityId) {
      // Check targeted invite token
      const { data: targetedInvite } = await supabase
        .from("community_invites")
        .select("id, community_id, invited_by, expires_at, accepted_at")
        .eq("token", cleanCode)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .single<{
          id: string;
          community_id: string;
          invited_by: string;
          expires_at: string;
          accepted_at: string | null;
        }>();

      if (targetedInvite) {
        targetCommunityId = targetedInvite.community_id;
        targetedInviteId = targetedInvite.id;
        inviterId = targetedInvite.invited_by;
      }
    }

    if (!targetCommunityId) {
      return {
        message: "Invalid or expired invite code. Please check the code and try again.",
      };
    }

    // Check if already a member (idempotency)
    const { data: existingMember } = await supabase
      .from("community_members")
      .select("id")
      .eq("community_id", targetCommunityId)
      .eq("user_id", userId)
      .single();

    if (!existingMember) {
      // Insert membership
      const { error: joinError } = await supabase
        .from("community_members")
        .insert({
          community_id: targetCommunityId,
          user_id: userId,
          role: "member",
          invited_by: inviterId,
        });

      if (joinError) {
        return {
          message: "Failed to join community. Please try again.",
        };
      }

      // Mark targeted invite accepted if applicable
      if (targetedInviteId) {
        await supabase
          .from("community_invites")
          .update({ accepted_at: new Date().toISOString() })
          .eq("id", targetedInviteId);
      }
    }

    joinedCommunityId = targetCommunityId;
  }

  // 4. Invalidate paths and redirect
  revalidatePath("/communities");
  revalidatePath(`/communities/${joinedCommunityId}`);
  redirect(`/communities/${joinedCommunityId}`);
}

// ---------------------------------------------------------------------------
// CREATE TARGETED INVITE
// ---------------------------------------------------------------------------

/**
 * Server Action: Generate a targeted invite token for a specific email or phone.
 */
export async function createInvite(
  _state: CreateInviteFormState,
  formData: FormData
): Promise<CreateInviteFormState> {
  // 1. Authentication
  const { userId } = await verifySession();

  // 2. Validation
  const raw = {
    community_id: formData.get("community_id"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  };

  const validated = CreateInviteSchema.safeParse(raw);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { community_id, email, phone } = validated.data;

  // 3. Authorization — verify caller belongs to community
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("community_members")
    .select("role")
    .eq("community_id", community_id)
    .eq("user_id", userId)
    .single();

  if (!membership) {
    return {
      message: "You must be a member of this community to send invites.",
    };
  }

  // 4. Generate token with 7-day expiration
  const token = generateInviteToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error: inviteError } = await supabase
    .from("community_invites")
    .insert({
      community_id,
      invited_by: userId,
      email: email || null,
      phone: phone || null,
      token,
      expires_at: expiresAt,
    });

  if (inviteError) {
    return {
      message: "Failed to generate invite. Please try again.",
    };
  }

  return {
    success: true,
    inviteToken: token,
  };
}

// ---------------------------------------------------------------------------
// DELETE / ARCHIVE COMMUNITY
// ---------------------------------------------------------------------------

/**
 * Archives (soft deletes) a community.
 * Requires caller to be an 'owner' or 'admin' of the community.
 */
export async function deleteCommunity(
  communityId: string
): Promise<{ success?: boolean; message?: string }> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  // Verify caller is owner or admin of this community
  const { data: membership, error: memberError } = await supabase
    .from("community_members")
    .select("role")
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .single();

  if (memberError || !membership || !["owner", "admin"].includes(membership.role)) {
    return {
      message: "Only a community owner or admin has permission to delete this community.",
    };
  }

  // Soft delete / archive the community
  const { error: archiveError } = await supabase
    .from("communities")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", communityId);

  if (archiveError) {
    return {
      message: "Failed to delete community: " + archiveError.message,
    };
  }

  // Remove caller's membership record so it disassociates immediately
  await supabase
    .from("community_members")
    .delete()
    .eq("community_id", communityId)
    .eq("user_id", userId);

  revalidatePath("/communities");
  revalidatePath("/profile");
  revalidatePath("/needs");
  revalidatePath("/listings");

  return { success: true };
}

// ---------------------------------------------------------------------------
// LEAVE COMMUNITY
// ---------------------------------------------------------------------------

/**
 * Removes the authenticated user from a community.
 */
export async function leaveCommunity(
  communityId: string
): Promise<{ success?: boolean; message?: string }> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("community_id", communityId)
    .eq("user_id", userId);

  if (error) {
    return {
      message: "Failed to leave community: " + error.message,
    };
  }

  revalidatePath("/communities");
  revalidatePath("/profile");
  revalidatePath("/needs");
  revalidatePath("/listings");

  return { success: true };
}
