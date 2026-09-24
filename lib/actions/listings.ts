"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/auth/dal";
import {
  CreateListingSchema,
  UpdateListingSchema,
  type CreateListingFormState,
  type UpdateListingFormState,
} from "@/lib/validations/listing";

// ---------------------------------------------------------------------------
// CREATE LISTING
// ---------------------------------------------------------------------------

/**
 * Server Action: Create Listing
 * Follows: Authenticate -> Validate -> Resolve community -> Authorize -> Mutate -> Revalidate -> Redirect
 */
export async function createListing(
  _state: CreateListingFormState,
  formData: FormData
): Promise<CreateListingFormState> {
  // 1. Authenticate
  const { userId } = await verifySession();

  // 2. Parse and Validate
  let mediaUrls: string[] = [];
  try {
    const rawMedia = formData.get("media_urls");
    if (rawMedia && typeof rawMedia === "string") {
      mediaUrls = JSON.parse(rawMedia);
    }
  } catch {
    mediaUrls = [];
  }

  let availabilitySlots: Array<{ day_of_week: number; time_from: string; time_to: string }> = [];
  try {
    const rawSlots = formData.get("availability_slots");
    if (rawSlots && typeof rawSlots === "string") {
      availabilitySlots = JSON.parse(rawSlots);
    }
  } catch {
    availabilitySlots = [];
  }

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    listing_type: formData.get("listing_type"),
    transaction_type: formData.get("transaction_type"),
    community_id: formData.get("community_id"),
    category_id: formData.get("category_id") || undefined,
    price_amount: formData.get("price_amount") || undefined,
    price_unit: formData.get("price_unit") || undefined,
    quantity: formData.get("quantity") || "1",
    condition: formData.get("condition") || undefined,
    media_urls: mediaUrls,
    availability_slots: availabilitySlots,
  };

  const validated = CreateListingSchema.safeParse(raw);
  if (!validated.success) {
    const fieldErrors = validated.error.flatten().fieldErrors;
    const firstErrorMessage = Object.values(fieldErrors).flat()[0];
    return {
      errors: fieldErrors,
      message: firstErrorMessage || "Please check your inputs and try again.",
    };
  }

  const {
    title,
    description,
    listing_type,
    transaction_type,
    community_id,
    category_id,
    price_amount,
    price_unit,
    quantity,
    condition,
  } = validated.data;

  const supabase = await createClient();

  // 3. Resolve active community & Authorize: Verify caller is an active member of community_id
  const { data: membership } = await supabase
    .from("community_members")
    .select("id")
    .eq("community_id", community_id)
    .eq("user_id", userId)
    .single();

  if (!membership) {
    return {
      message: "You must be an active member of this community to create a listing.",
    };
  }

  // 4. Database Mutation: Insert Listing
  const insertData = {
    community_id,
    owner_id: userId,
    category_id: category_id || null,
    title,
    description: description || null,
    listing_type,
    transaction_type,
    price_amount: price_amount != null && price_amount > 0 ? price_amount : null,
    price_unit: price_amount != null && price_amount > 0 && price_unit ? price_unit : null,
    quantity,
    condition: listing_type === "item" && condition ? condition : null,
    status: "active",
    published_at: new Date().toISOString(),
  };

  const { data: newListing, error: insertError } = await supabase
    .from("listings")
    .insert(insertData)
    .select("id")
    .single<{ id: string }>();

  if (insertError || !newListing) {
    console.error("Listing insert error:", insertError);
    return {
      message: insertError?.message || "Failed to publish listing. Please check your inputs and try again.",
    };
  }

  const listingId = newListing.id;

  // 5. Insert Media items if provided
  if (mediaUrls.length > 0) {
    const mediaInserts = mediaUrls.map((url, index) => ({
      listing_id: listingId,
      storage_path: url,
      url,
      mime_type: "image/jpeg",
      sort_order: index,
    }));

    await supabase.from("listing_media").insert(mediaInserts);
  }

  // 6. Insert Availability slots if provided
  if (availabilitySlots.length > 0) {
    const availabilityInserts = availabilitySlots.map((slot) => ({
      listing_id: listingId,
      day_of_week: slot.day_of_week,
      time_from: slot.time_from,
      time_to: slot.time_to,
      is_available: true,
    }));

    await supabase.from("listing_availability").insert(availabilityInserts);
  }

  // 7. Invalidate and Redirect
  revalidatePath("/listings");
  revalidatePath("/my-listings");
  revalidatePath(`/communities/${community_id}`);
  redirect(`/listings/${listingId}`);
}

// ---------------------------------------------------------------------------
// UPDATE LISTING
// ---------------------------------------------------------------------------

/**
 * Server Action: Update Listing
 */
export async function updateListing(
  _state: UpdateListingFormState,
  formData: FormData
): Promise<UpdateListingFormState> {
  const { userId } = await verifySession();

  const raw = {
    listing_id: formData.get("listing_id"),
    title: formData.get("title"),
    description: formData.get("description"),
    category_id: formData.get("category_id") || undefined,
    price_amount: formData.get("price_amount") || undefined,
    price_unit: formData.get("price_unit") || undefined,
    quantity: formData.get("quantity") || undefined,
    condition: formData.get("condition") || undefined,
  };

  const validated = UpdateListingSchema.safeParse(raw);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const {
    listing_id,
    title,
    description,
    category_id,
    price_amount,
    price_unit,
    quantity,
    condition,
  } = validated.data;

  const supabase = await createClient();

  // Authorize: Verify ownership or community admin
  const { data: existingListing } = await supabase
    .from("listings")
    .select("owner_id, community_id, listing_type")
    .eq("id", listing_id)
    .single();

  if (!existingListing) {
    return { message: "Listing not found." };
  }

  const isOwner = existingListing.owner_id === userId;
  if (!isOwner) {
    const { data: membership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", existingListing.community_id)
      .eq("user_id", userId)
      .single();

    if (!membership || !["admin", "owner"].includes(membership.role)) {
      return { message: "You are not authorized to update this listing." };
    }
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description || null;
  if (category_id !== undefined) updateData.category_id = category_id || null;
  if (quantity !== undefined) updateData.quantity = quantity;
  if (price_amount !== undefined) {
    updateData.price_amount = price_amount != null && price_amount > 0 ? price_amount : null;
    updateData.price_unit = price_amount != null && price_amount > 0 && price_unit ? price_unit : null;
  }
  if (existingListing.listing_type === "item" && condition !== undefined) {
    updateData.condition = condition || null;
  }

  const { error: updateError } = await supabase
    .from("listings")
    .update(updateData)
    .eq("id", listing_id);

  if (updateError) {
    return { message: "Failed to update listing." };
  }

  revalidatePath("/listings");
  revalidatePath("/my-listings");
  revalidatePath(`/listings/${listing_id}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// LIFECYCLE MUTATIONS
// ---------------------------------------------------------------------------

async function mutateListingStatus(
  listingId: string,
  newStatus: "active" | "paused" | "unavailable" | "archived"
): Promise<{ success?: boolean; error?: string }> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data: existingListing } = await supabase
    .from("listings")
    .select("owner_id, community_id")
    .eq("id", listingId)
    .single();

  if (!existingListing) {
    return { error: "Listing not found." };
  }

  const isOwner = existingListing.owner_id === userId;
  if (!isOwner) {
    const { data: membership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", existingListing.community_id)
      .eq("user_id", userId)
      .single();

    if (!membership || !["admin", "owner"].includes(membership.role)) {
      return { error: "You are not authorized to manage this listing." };
    }
  }

  const updatePayload: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === "archived") {
    updatePayload.archived_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("listings")
    .update(updatePayload)
    .eq("id", listingId);

  if (updateError) {
    return { error: `Failed to change listing status to ${newStatus}.` };
  }

  revalidatePath("/listings");
  revalidatePath("/my-listings");
  revalidatePath(`/listings/${listingId}`);
  return { success: true };
}

export async function pauseListing(listingId: string) {
  return mutateListingStatus(listingId, "paused");
}

export async function resumeListing(listingId: string) {
  return mutateListingStatus(listingId, "active");
}

export async function markListingUnavailable(listingId: string) {
  return mutateListingStatus(listingId, "unavailable");
}

export async function archiveListing(listingId: string) {
  return mutateListingStatus(listingId, "archived");
}
