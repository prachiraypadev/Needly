"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/auth/dal";
import {
  CreateNeedSchema,
  UpdateNeedSchema,
  type CreateNeedFormState,
  type UpdateNeedFormState,
} from "@/lib/validations/need";

// ---------------------------------------------------------------------------
// CREATE NEED
// ---------------------------------------------------------------------------

/**
 * Server Action: Create Need
 * Follows: authenticate -> validate -> resolve active community -> authorize -> mutate -> revalidate -> redirect
 */
export async function createNeed(
  _state: CreateNeedFormState,
  formData: FormData
): Promise<CreateNeedFormState> {
  // 1. Authenticate
  const { userId } = await verifySession();

  // 2. Validate
  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    need_type: formData.get("need_type"),
    community_id: formData.get("community_id"),
    category_id: formData.get("category_id") || undefined,
    quantity: formData.get("quantity") || "1",
    budget_min: formData.get("budget_min") || undefined,
    budget_max: formData.get("budget_max") || undefined,
    needed_from: formData.get("needed_from") || undefined,
    needed_until: formData.get("needed_until") || undefined,
  };

  const validated = CreateNeedSchema.safeParse(raw);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const {
    title,
    description,
    need_type,
    community_id,
    category_id,
    quantity,
    budget_min,
    budget_max,
    needed_from,
    needed_until,
  } = validated.data;

  const supabase = await createClient();

  // 3. Resolve active community & Authorize (Verify caller is a member of community_id)
  const { data: membership } = await supabase
    .from("community_members")
    .select("id")
    .eq("community_id", community_id)
    .eq("user_id", userId)
    .single();

  if (!membership) {
    return {
      message: "You must be a member of this community to post a need.",
    };
  }

  // 4. Database Mutation
  const insertData = {
    community_id,
    requester_id: userId,
    title,
    description: description || null,
    need_type,
    category_id: category_id || null,
    quantity,
    budget_min: budget_min != null && budget_min > 0 ? budget_min : null,
    budget_max: budget_max != null && budget_max > 0 ? budget_max : null,
    needed_from: needed_from ? new Date(needed_from).toISOString() : null,
    needed_until: needed_until ? new Date(needed_until).toISOString() : null,
    status: "open",
  };

  const { data: newNeed, error: insertError } = await supabase
    .from("needs")
    .insert(insertData)
    .select("id")
    .single<{ id: string }>();

  if (insertError || !newNeed) {
    return {
      message: "Failed to publish need. Please check your inputs and try again.",
    };
  }

  // 5. Revalidate and redirect
  revalidatePath("/needs");
  revalidatePath(`/communities/${community_id}`);
  redirect(`/needs/${newNeed.id}`);
}

// ---------------------------------------------------------------------------
// UPDATE NEED
// ---------------------------------------------------------------------------

/**
 * Server Action: Update Need
 */
export async function updateNeed(
  _state: UpdateNeedFormState,
  formData: FormData
): Promise<UpdateNeedFormState> {
  // 1. Authenticate
  const { userId } = await verifySession();

  // 2. Validate
  const raw = {
    need_id: formData.get("need_id"),
    title: formData.get("title"),
    description: formData.get("description"),
    category_id: formData.get("category_id") || undefined,
    quantity: formData.get("quantity") || undefined,
    budget_min: formData.get("budget_min") || undefined,
    budget_max: formData.get("budget_max") || undefined,
    needed_from: formData.get("needed_from") || undefined,
    needed_until: formData.get("needed_until") || undefined,
  };

  const validated = UpdateNeedSchema.safeParse(raw);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const {
    need_id,
    title,
    description,
    category_id,
    quantity,
    budget_min,
    budget_max,
    needed_from,
    needed_until,
  } = validated.data;

  const supabase = await createClient();

  // 3. Authorize: Verify ownership or admin permissions
  const { data: existingNeed } = await supabase
    .from("needs")
    .select("requester_id, community_id")
    .eq("id", need_id)
    .single();

  if (!existingNeed) {
    return {
      message: "Need not found.",
    };
  }

  const isOwner = existingNeed.requester_id === userId;
  if (!isOwner) {
    const { data: membership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", existingNeed.community_id)
      .eq("user_id", userId)
      .single();

    if (!membership || !["admin", "owner"].includes(membership.role)) {
      return {
        message: "You are not authorized to edit this need.",
      };
    }
  }

  // 4. Database Mutation
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description || null;
  if (category_id !== undefined) updateData.category_id = category_id || null;
  if (quantity !== undefined) updateData.quantity = quantity;
  if (budget_min !== undefined) updateData.budget_min = budget_min != null && budget_min > 0 ? budget_min : null;
  if (budget_max !== undefined) updateData.budget_max = budget_max != null && budget_max > 0 ? budget_max : null;
  if (needed_from !== undefined) updateData.needed_from = needed_from ? new Date(needed_from).toISOString() : null;
  if (needed_until !== undefined) updateData.needed_until = needed_until ? new Date(needed_until).toISOString() : null;

  const { error: updateError } = await supabase
    .from("needs")
    .update(updateData)
    .eq("id", need_id);

  if (updateError) {
    return {
      message: "Failed to update need.",
    };
  }

  revalidatePath("/needs");
  revalidatePath(`/needs/${need_id}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// CANCEL NEED
// ---------------------------------------------------------------------------

/**
 * Server Action: Cancel Need
 */
export async function cancelNeed(needId: string): Promise<{ success?: boolean; error?: string }> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  // Authorize
  const { data: existingNeed } = await supabase
    .from("needs")
    .select("requester_id, community_id, status")
    .eq("id", needId)
    .single();

  if (!existingNeed) {
    return { error: "Need not found." };
  }

  const isOwner = existingNeed.requester_id === userId;
  if (!isOwner) {
    const { data: membership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", existingNeed.community_id)
      .eq("user_id", userId)
      .single();

    if (!membership || !["admin", "owner"].includes(membership.role)) {
      return { error: "You are not authorized to cancel this need." };
    }
  }

  const { error: updateError } = await supabase
    .from("needs")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", needId);

  if (updateError) {
    return { error: "Failed to cancel need." };
  }

  revalidatePath("/needs");
  revalidatePath(`/needs/${needId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// MARK NEED FULFILLED
// ---------------------------------------------------------------------------

/**
 * Server Action: Mark Need as Fulfilled
 */
export async function markNeedFulfilled(
  needId: string,
  fulfillmentNotes?: string
): Promise<{ success?: boolean; error?: string }> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  // Authorize
  const { data: existingNeed } = await supabase
    .from("needs")
    .select("requester_id, community_id")
    .eq("id", needId)
    .single();

  if (!existingNeed) {
    return { error: "Need not found." };
  }

  const isOwner = existingNeed.requester_id === userId;
  if (!isOwner) {
    const { data: membership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", existingNeed.community_id)
      .eq("user_id", userId)
      .single();

    if (!membership || !["admin", "owner"].includes(membership.role)) {
      return { error: "You are not authorized to mark this need as fulfilled." };
    }
  }

  const { error: updateError } = await supabase
    .from("needs")
    .update({
      status: "fulfilled",
      fulfillment_notes: fulfillmentNotes || "Fulfilled by community member",
      updated_at: new Date().toISOString(),
    })
    .eq("id", needId);

  if (updateError) {
    return { error: "Failed to update need status." };
  }

  revalidatePath("/needs");
  revalidatePath(`/needs/${needId}`);
  return { success: true };
}
