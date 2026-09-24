"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/auth/dal";
import { CreateOfferSchema, type OfferFormState } from "@/lib/validations/offer";

// ---------------------------------------------------------------------------
// 1. CREATE OFFER (Neighbor says "I have this!")
// ---------------------------------------------------------------------------
export async function createOffer(
  _prevState: OfferFormState,
  formData: FormData
): Promise<OfferFormState> {
  // 1. Authenticate
  const { userId } = await verifySession();

  // 2. Validate input
  const raw = {
    need_id: formData.get("need_id"),
    message: formData.get("message"),
    price_amount: formData.get("price_amount") || undefined,
    available_from: formData.get("available_from") || undefined,
    available_until: formData.get("available_until") || undefined,
  };

  const validated = CreateOfferSchema.safeParse(raw);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { need_id, message, price_amount, available_from, available_until } =
    validated.data;

  const supabase = await createClient();

  // 3. Fetch need and verify ownership / status
  const { data: need, error: needError } = await supabase
    .from("needs")
    .select("id, requester_id, community_id, status")
    .eq("id", need_id)
    .single();

  if (needError || !need) {
    return { message: "The requested need was not found." };
  }

  if (need.status !== "open") {
    return { message: `This need is no longer open for offers (status: ${need.status}).` };
  }

  if (need.requester_id === userId) {
    return { message: "You cannot make an offer on your own need request." };
  }

  // 4. Verify provider is a member of the community
  const { data: membership } = await supabase
    .from("community_members")
    .select("id")
    .eq("community_id", need.community_id)
    .eq("user_id", userId)
    .single();

  if (!membership) {
    return { message: "You must be a member of this community to offer help." };
  }

  // 5. Insert Offer
  const insertData = {
    need_id,
    provider_id: userId,
    community_id: need.community_id,
    message,
    price_amount: price_amount != null && price_amount > 0 ? price_amount : null,
    available_from: available_from ? new Date(available_from).toISOString() : null,
    available_until: available_until ? new Date(available_until).toISOString() : null,
    status: "pending",
  };

  const { error: insertError } = await supabase
    .from("offers")
    .insert(insertData);

  if (insertError) {
    if (insertError.code === "23505") {
      return { message: "You have already submitted an active offer for this request." };
    }
    console.error("[createOffer] Supabase insert error:", insertError);
    return { message: "Failed to submit offer. Please try again." };
  }

  // 6. Revalidate
  revalidatePath(`/needs/${need_id}`);
  return { success: true, message: "Your offer has been submitted successfully to your neighbor!" };
}

// ---------------------------------------------------------------------------
// 2. ACCEPT OFFER (Requester accepts neighbor's help)
// ---------------------------------------------------------------------------
export async function acceptOfferAction(
  offerId: string,
  needId: string
): Promise<{ success?: boolean; error?: string }> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  // Call the atomic stored procedure defined in 20260827000001_atomic_procedures.sql
  const { data: transactionId, error } = await supabase.rpc("accept_offer", {
    p_offer_id: offerId,
    p_requester_id: userId,
  });

  if (error) {
    console.error("[acceptOfferAction] RPC error:", error);
    return { error: error.message || "Failed to accept offer." };
  }

  revalidatePath(`/needs/${needId}`);
  revalidatePath("/needs");
  return { success: true };
}

// ---------------------------------------------------------------------------
// 3. REJECT OFFER (Requester politely declines an offer)
// ---------------------------------------------------------------------------
export async function rejectOfferAction(
  offerId: string,
  needId: string
): Promise<{ success?: boolean; error?: string }> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  // Verify caller is the requester of the need
  const { data: offer } = await supabase
    .from("offers")
    .select("id, need:needs(requester_id)")
    .eq("id", offerId)
    .single();

  const needRequesterId = (offer?.need as unknown as { requester_id: string })?.requester_id;
  if (!offer || needRequesterId !== userId) {
    return { error: "You are not authorized to reject this offer." };
  }

  const { error: updateError } = await supabase
    .from("offers")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", offerId);

  if (updateError) {
    return { error: "Failed to reject offer." };
  }

  revalidatePath(`/needs/${needId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// 4. WITHDRAW OFFER (Provider cancels their own pending offer)
// ---------------------------------------------------------------------------
export async function withdrawOfferAction(
  offerId: string,
  needId: string
): Promise<{ success?: boolean; error?: string }> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("offers")
    .update({ status: "withdrawn", updated_at: new Date().toISOString() })
    .eq("id", offerId)
    .eq("provider_id", userId)
    .eq("status", "pending");

  if (updateError) {
    return { error: "Failed to withdraw offer." };
  }

  revalidatePath(`/needs/${needId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// 5. COMPLETE TRANSACTION (Confirm return / completion of item/service)
// ---------------------------------------------------------------------------
export async function completeTransactionAction(
  transactionId: string,
  needId: string
): Promise<{ success?: boolean; error?: string }> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  // Verify caller is participant
  const { data: tx } = await supabase
    .from("transactions")
    .select("id, requester_id, provider_id, status")
    .eq("id", transactionId)
    .single();

  if (!tx || (tx.requester_id !== userId && tx.provider_id !== userId)) {
    return { error: "You are not authorized to complete this transaction." };
  }

  // 1. Mark transaction completed
  const { error: txError } = await supabase
    .from("transactions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", transactionId);

  if (txError) {
    return { error: "Failed to update transaction status." };
  }

  // 2. Mark need fulfilled
  await supabase
    .from("needs")
    .update({
      status: "fulfilled",
      fulfillment_notes: "Successfully fulfilled and completed by neighbor.",
      updated_at: new Date().toISOString(),
    })
    .eq("id", needId);

  revalidatePath(`/needs/${needId}`);
  revalidatePath("/needs");
  return { success: true };
}
