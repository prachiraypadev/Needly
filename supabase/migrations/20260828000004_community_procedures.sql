-- ==============================================================================
-- NEEDLY MIGRATION 20260828000004: ATOMIC COMMUNITY PROCEDURES & JOIN LOGIC
-- Provides atomic creation and join procedures for communities & memberships.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PROCEDURE: create_community_with_owner
-- Atomically creates a community and sets the caller (auth.uid()) as its 'owner'.
-- Both operations must succeed or both fail together in the same transaction.
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_community_with_owner(
  p_name TEXT,
  p_slug TEXT,
  p_description TEXT,
  p_type TEXT,
  p_is_private BOOLEAN,
  p_invite_code TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARATION
DECLARE
  v_user_id UUID;
  v_community_id UUID;
BEGIN
  -- 1. Get authenticated caller ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create a community.';
  END IF;

  -- 2. Validate community type
  IF p_type NOT IN ('apartment','gated','hostel','college','university','office','family','other') THEN
    RAISE EXCEPTION 'Invalid community type: %.', p_type;
  END IF;

  -- 3. Insert community record
  INSERT INTO public.communities (
    name,
    slug,
    description,
    type,
    is_private,
    invite_code,
    created_by
  ) VALUES (
    TRIM(p_name),
    LOWER(TRIM(p_slug)),
    NULLIF(TRIM(p_description), ''),
    p_type,
    COALESCE(p_is_private, TRUE),
    NULLIF(UPPER(TRIM(p_invite_code)), ''),
    v_user_id
  )
  RETURNING id INTO v_community_id;

  -- 4. Atomically insert owner membership record
  INSERT INTO public.community_members (
    community_id,
    user_id,
    role
  ) VALUES (
    v_community_id,
    v_user_id,
    'owner'
  );

  RETURN v_community_id;
END;
$$;

-- ------------------------------------------------------------------------------
-- PROCEDURE: join_community_by_code
-- Atomically validates an invite code (general code OR targeted token)
-- and creates a 'member' membership for the calling user.
-- Handles:
-- - General community invite codes (communities.invite_code)
-- - Targeted invite tokens (community_invites.token with expiration check)
-- - Duplicate membership prevention (idempotent: returns community_id without error)
-- - Marking targeted invites as accepted
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.join_community_by_code(
  p_code TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_clean_code TEXT;
  v_community_id UUID;
  v_inviter_id UUID;
  v_invite_id UUID;
BEGIN
  -- 1. Verify caller is authenticated
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to join a community.';
  END IF;

  v_clean_code := TRIM(p_code);
  IF v_clean_code IS NULL OR v_clean_code = '' THEN
    RAISE EXCEPTION 'Invite code cannot be empty.';
  END IF;

  -- 2. First, check if code matches a general community invite code
  SELECT id INTO v_community_id
  FROM public.communities
  WHERE UPPER(invite_code) = UPPER(v_clean_code)
    AND archived_at IS NULL;

  -- 3. If not matched, check if code matches an active targeted invite token
  IF v_community_id IS NULL THEN
    SELECT id, community_id, invited_by INTO v_invite_id, v_community_id, v_inviter_id
    FROM public.community_invites
    WHERE token = v_clean_code
      AND accepted_at IS NULL
      AND expires_at > NOW();

    -- Verify the target community is not archived
    IF v_community_id IS NOT NULL THEN
      IF EXISTS (SELECT 1 FROM public.communities WHERE id = v_community_id AND archived_at IS NOT NULL) THEN
        RAISE EXCEPTION 'This community is no longer active.';
      END IF;
    END IF;
  END IF;

  -- 4. If code is invalid or expired
  IF v_community_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code.';
  END IF;

  -- 5. Prevent duplicate membership (idempotent check)
  IF EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = v_community_id AND user_id = v_user_id
  ) THEN
    -- Already a member, return community ID cleanly
    RETURN v_community_id;
  END IF;

  -- 6. Insert new community membership
  INSERT INTO public.community_members (
    community_id,
    user_id,
    role,
    invited_by
  ) VALUES (
    v_community_id,
    v_user_id,
    'member',
    v_inviter_id
  );

  -- 7. If targeted invite was used, mark it accepted
  IF v_invite_id IS NOT NULL THEN
    UPDATE public.community_invites
    SET accepted_at = NOW()
    WHERE id = v_invite_id;
  END IF;

  RETURN v_community_id;
END;
$$;

-- Revoke public execution to ensure only authenticated users can run these procedures
REVOKE ALL ON FUNCTION public.create_community_with_owner(TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_community_with_owner(TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.join_community_by_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_community_by_code(TEXT) TO authenticated;
