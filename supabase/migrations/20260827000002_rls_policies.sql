-- ==============================================================================
-- NEEDLY MIGRATION 20260827000002: ROW LEVEL SECURITY (RLS) POLICIES
-- Enables and configures RLS for all 25 tables.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- HELPER RLS FUNCTIONS
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_community_member(p_community_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM community_members
    WHERE community_id = p_community_id
      AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION get_community_role(p_community_id UUID, p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM community_members
  WHERE community_id = p_community_id
    AND user_id = p_user_id
  LIMIT 1;
$$;


-- ------------------------------------------------------------------------------
-- ENABLE RLS ON ALL TABLES
-- ------------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_invites ENABLE ROW LEVEL SECURITY;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_availability ENABLE ROW LEVEL SECURITY;

ALTER TABLE needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE need_media ENABLE ROW LEVEL SECURITY;

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_jobs ENABLE ROW LEVEL SECURITY;

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------------------------
-- POLICIES: DOMAIN 1 - IDENTITY
-- ------------------------------------------------------------------------------

-- profiles
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_self" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_insert_self" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- communities
CREATE POLICY "communities_select_members_or_public" ON communities FOR SELECT USING (
  is_private = false OR is_community_member(id, auth.uid())
);
CREATE POLICY "communities_insert_authenticated" ON communities FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND created_by = auth.uid()
);
CREATE POLICY "communities_update_admin_owner" ON communities FOR UPDATE USING (
  get_community_role(id, auth.uid()) IN ('admin', 'owner')
);

-- community_members
CREATE POLICY "community_members_select" ON community_members FOR SELECT USING (
  is_community_member(community_id, auth.uid())
);
CREATE POLICY "community_members_insert" ON community_members FOR INSERT WITH CHECK (
  user_id = auth.uid() OR get_community_role(community_id, auth.uid()) IN ('admin', 'owner')
);
CREATE POLICY "community_members_update_admin" ON community_members FOR UPDATE USING (
  get_community_role(community_id, auth.uid()) IN ('admin', 'owner')
);
CREATE POLICY "community_members_delete_self_or_admin" ON community_members FOR DELETE USING (
  user_id = auth.uid() OR get_community_role(community_id, auth.uid()) IN ('admin', 'owner')
);

-- community_invites
CREATE POLICY "community_invites_select" ON community_invites FOR SELECT USING (
  is_community_member(community_id, auth.uid())
);
CREATE POLICY "community_invites_insert_admin" ON community_invites FOR INSERT WITH CHECK (
  get_community_role(community_id, auth.uid()) IN ('moderator', 'admin', 'owner')
);


-- ------------------------------------------------------------------------------
-- POLICIES: DOMAIN 2 - CATALOG
-- ------------------------------------------------------------------------------

-- categories
CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);

-- listings
CREATE POLICY "listings_select_community_members" ON listings FOR SELECT USING (
  is_community_member(community_id, auth.uid())
);
CREATE POLICY "listings_insert_owner" ON listings FOR INSERT WITH CHECK (
  owner_id = auth.uid() AND is_community_member(community_id, auth.uid())
);
CREATE POLICY "listings_update_owner_or_admin" ON listings FOR UPDATE USING (
  owner_id = auth.uid() OR get_community_role(community_id, auth.uid()) IN ('admin', 'owner')
);

-- listing_media
CREATE POLICY "listing_media_select" ON listing_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND is_community_member(community_id, auth.uid()))
);
CREATE POLICY "listing_media_insert_owner" ON listing_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND owner_id = auth.uid())
);

-- listing_availability
CREATE POLICY "listing_availability_select" ON listing_availability FOR SELECT USING (
  EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND is_community_member(community_id, auth.uid()))
);
CREATE POLICY "listing_availability_manage_owner" ON listing_availability FOR ALL USING (
  EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND owner_id = auth.uid())
);


-- ------------------------------------------------------------------------------
-- POLICIES: DOMAIN 3 - DEMAND
-- ------------------------------------------------------------------------------

-- needs
CREATE POLICY "needs_select_community_members" ON needs FOR SELECT USING (
  is_community_member(community_id, auth.uid())
);
CREATE POLICY "needs_insert_requester" ON needs FOR INSERT WITH CHECK (
  requester_id = auth.uid() AND is_community_member(community_id, auth.uid())
);
CREATE POLICY "needs_update_requester_or_admin" ON needs FOR UPDATE USING (
  requester_id = auth.uid() OR get_community_role(community_id, auth.uid()) IN ('admin', 'owner')
);

-- need_media
CREATE POLICY "need_media_select" ON need_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM needs WHERE id = need_id AND is_community_member(community_id, auth.uid()))
);
CREATE POLICY "need_media_insert_requester" ON need_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM needs WHERE id = need_id AND requester_id = auth.uid())
);


-- ------------------------------------------------------------------------------
-- POLICIES: DOMAIN 4 - FULFILLMENT
-- ------------------------------------------------------------------------------

-- offers
CREATE POLICY "offers_select_parties_or_admin" ON offers FOR SELECT USING (
  provider_id = auth.uid()
  OR EXISTS (SELECT 1 FROM needs WHERE id = need_id AND requester_id = auth.uid())
  OR get_community_role(community_id, auth.uid()) IN ('admin', 'owner')
);
CREATE POLICY "offers_insert_provider" ON offers FOR INSERT WITH CHECK (
  provider_id = auth.uid() AND is_community_member(community_id, auth.uid())
);
CREATE POLICY "offers_update_provider_or_requester" ON offers FOR UPDATE USING (
  provider_id = auth.uid()
  OR EXISTS (SELECT 1 FROM needs WHERE id = need_id AND requester_id = auth.uid())
);

-- transactions
CREATE POLICY "transactions_select_parties_or_admin" ON transactions FOR SELECT USING (
  requester_id = auth.uid()
  OR provider_id = auth.uid()
  OR get_community_role(community_id, auth.uid()) IN ('admin', 'owner')
);
CREATE POLICY "transactions_update_parties_or_admin" ON transactions FOR UPDATE USING (
  requester_id = auth.uid()
  OR provider_id = auth.uid()
  OR get_community_role(community_id, auth.uid()) IN ('admin', 'owner')
);

-- rental_details & service_jobs
CREATE POLICY "rental_details_select" ON rental_details FOR SELECT USING (
  EXISTS (SELECT 1 FROM transactions WHERE id = transaction_id AND (requester_id = auth.uid() OR provider_id = auth.uid()))
);
CREATE POLICY "service_jobs_select" ON service_jobs FOR SELECT USING (
  EXISTS (SELECT 1 FROM transactions WHERE id = transaction_id AND (requester_id = auth.uid() OR provider_id = auth.uid()))
);


-- ------------------------------------------------------------------------------
-- POLICIES: DOMAIN 5 - COMMUNICATION
-- ------------------------------------------------------------------------------

-- conversations
CREATE POLICY "conversations_select_participants" ON conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = id AND user_id = auth.uid())
);

-- conversation_participants
CREATE POLICY "conversation_participants_select" ON conversation_participants FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid())
);

-- messages
CREATE POLICY "messages_select_participants" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "messages_insert_sender" ON messages FOR INSERT WITH CHECK (
  (sender_id = auth.uid() OR is_system = true)
  AND EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);


-- ------------------------------------------------------------------------------
-- POLICIES: DOMAIN 6 & 7 & 8 - TRUST, FINANCIALS, PLATFORM
-- ------------------------------------------------------------------------------

-- reviews
CREATE POLICY "reviews_select_all" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_reviewer" ON reviews FOR INSERT WITH CHECK (
  reviewer_id = auth.uid()
);

-- disputes & reports
CREATE POLICY "disputes_select_parties" ON disputes FOR SELECT USING (
  raised_by = auth.uid() OR EXISTS (SELECT 1 FROM transactions WHERE id = transaction_id AND (requester_id = auth.uid() OR provider_id = auth.uid()))
);
CREATE POLICY "reports_select_reporter" ON reports FOR SELECT USING (
  reporter_id = auth.uid()
);
CREATE POLICY "reports_insert_reporter" ON reports FOR INSERT WITH CHECK (
  reporter_id = auth.uid()
);

-- payments
CREATE POLICY "payments_select_parties" ON payments FOR SELECT USING (
  payer_id = auth.uid() OR payee_id = auth.uid()
);

-- notifications
CREATE POLICY "notifications_select_self" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update_self" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- saved_listings & saved_needs
CREATE POLICY "saved_listings_all_self" ON saved_listings FOR ALL USING (user_id = auth.uid());
CREATE POLICY "saved_needs_all_self" ON saved_needs FOR ALL USING (user_id = auth.uid());

-- audit_logs (append-only: SELECT admin, INSERT authenticated, NO UPDATE/DELETE)
CREATE POLICY "audit_logs_select_admin" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM community_members WHERE user_id = auth.uid() AND role IN ('admin', 'owner'))
);
CREATE POLICY "audit_logs_insert_authenticated" ON audit_logs FOR INSERT WITH CHECK (
  actor_id = auth.uid()
);
