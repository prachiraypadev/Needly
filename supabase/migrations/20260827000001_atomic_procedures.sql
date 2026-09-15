-- ==============================================================================
-- NEEDLY MIGRATION 20260827000001: ATOMIC STORED PROCEDURES & BUSINESS LOGIC
-- Implements atomic concurrency-safe operations for offer acceptance and transactions.
-- ==============================================================================

CREATE OR REPLACE FUNCTION accept_offer(
  p_offer_id UUID,
  p_requester_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offer RECORD;
  v_need RECORD;
  v_transaction_id UUID;
  v_conversation_id UUID;
BEGIN
  -- 1. Lock the offer row to prevent concurrent acceptance / withdrawal
  SELECT * INTO v_offer
  FROM offers
  WHERE id = p_offer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer not found (ID: %).', p_offer_id;
  END IF;

  IF v_offer.status != 'pending' THEN
    RAISE EXCEPTION 'Offer cannot be accepted because its status is "%".', v_offer.status;
  END IF;

  -- 2. Lock the corresponding need row
  SELECT * INTO v_need
  FROM needs
  WHERE id = v_offer.need_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Associated need not found (ID: %).', v_offer.need_id;
  END IF;

  IF v_need.requester_id != p_requester_id THEN
    RAISE EXCEPTION 'Only the need requester can accept an offer.';
  END IF;

  IF v_need.status != 'open' THEN
    RAISE EXCEPTION 'Need is not open for acceptance (status: %).', v_need.status;
  END IF;

  -- 3. Check for existing active transaction on this need
  IF EXISTS (
    SELECT 1 FROM transactions
    WHERE need_id = v_need.id
      AND status NOT IN ('cancelled')
  ) THEN
    RAISE EXCEPTION 'An active transaction already exists for this need.';
  END IF;

  -- 4. Transition offer and need statuses atomically
  UPDATE offers
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_offer_id;

  -- Reject other pending offers for this single-item need
  UPDATE offers
  SET status = 'rejected', updated_at = NOW()
  WHERE need_id = v_need.id
    AND id != p_offer_id
    AND status = 'pending';

  UPDATE needs
  SET status = 'in_progress', updated_at = NOW()
  WHERE id = v_need.id;

  -- 5. Create the transaction record
  INSERT INTO transactions (
    community_id,
    need_id,
    offer_id,
    listing_id,
    requester_id,
    provider_id,
    type,
    agreed_amount,
    currency,
    status
  ) VALUES (
    v_need.community_id,
    v_need.id,
    v_offer.id,
    v_offer.listing_id,
    p_requester_id,
    v_offer.provider_id,
    v_need.need_type,
    COALESCE(v_offer.price_amount, 0),
    'INR',
    'requested'
  ) RETURNING id INTO v_transaction_id;

  -- 6. Create modality-specific detail extension
  IF v_need.need_type IN ('borrow', 'rent') THEN
    INSERT INTO rental_details (
      transaction_id,
      deposit_amount
    ) VALUES (
      v_transaction_id,
      0
    );
  ELSIF v_need.need_type = 'service' THEN
    INSERT INTO service_jobs (
      transaction_id,
      job_status
    ) VALUES (
      v_transaction_id,
      'scheduled'
    );
  END IF;

  -- 7. Create or link context conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE need_id = v_need.id
  LIMIT 1;

  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (
      community_id,
      need_id,
      title
    ) VALUES (
      v_need.community_id,
      v_need.id,
      v_need.title
    ) RETURNING id INTO v_conversation_id;

    -- Add both participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (v_conversation_id, p_requester_id),
           (v_conversation_id, v_offer.provider_id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert automated system message into conversation
  INSERT INTO messages (
    conversation_id,
    sender_id,
    body,
    is_system
  ) VALUES (
    v_conversation_id,
    p_requester_id,
    'Offer accepted! Transaction requested.',
    TRUE
  );

  RETURN v_transaction_id;
END;
$$;
