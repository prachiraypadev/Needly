-- ==============================================================================
-- NEEDLY MIGRATION 20260828000003: PROFILE AUTO-CREATION TRIGGER
-- Creates a trigger on auth.users to automatically insert a public.profiles row
-- when a new user registers. Idempotent via ON CONFLICT DO NOTHING.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- FUNCTION: handle_new_user
-- Called AFTER INSERT on auth.users.
-- Seeds display_name from raw_user_meta_data if provided during sign up,
-- otherwise falls back to the email prefix (before '@').
-- SECURITY DEFINER is required to write to public.profiles from auth schema context.
-- search_path is pinned to public to prevent search_path injection.
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Revoke public execute to prevent direct calls from non-privileged roles.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- ------------------------------------------------------------------------------
-- TRIGGER: on_auth_user_created
-- Fires once per new auth.users row, after insert.
-- ------------------------------------------------------------------------------

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
