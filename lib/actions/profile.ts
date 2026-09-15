"use server";

import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/auth/dal";
import { UpdateProfileSchema, ProfileFormState } from "@/lib/validations/auth";

/**
 * Server Action: update the authenticated user's profile.
 * Validates input, enforces session ownership, then updates the profiles table.
 * RLS on the profiles table ensures users can only update their own row.
 */
export async function updateProfile(
  _state: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  // 1. Verify session — redirects to /login if not authenticated
  const { userId } = await verifySession();

  // 2. Validate input
  const raw = {
    display_name: formData.get("display_name"),
    bio: formData.get("bio"),
    phone: formData.get("phone"),
  };

  const validated = UpdateProfileSchema.safeParse(raw);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { display_name, bio, phone } = validated.data;

  // Build update payload — only include defined non-empty values
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (display_name !== undefined && display_name !== "") {
    updateData.display_name = display_name;
  }
  if (bio !== undefined) {
    updateData.bio = bio === "" ? null : bio;
  }
  if (phone !== undefined) {
    updateData.phone = phone === "" ? null : phone;
  }

  // 3. Update in Supabase — RLS policy on profiles enforces id = auth.uid()
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId);

  if (error) {
    return {
      message: "Failed to save profile. Please try again.",
    };
  }

  return { success: true };
}
