-- ==============================================================================
-- NEEDLY MIGRATION 20260827000000: CANONICAL SCHEMA V2.0
-- Covers 25 tables across 8 domains with strict referential integrity.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. TRIGGERS & UTILITY FUNCTIONS
-- ------------------------------------------------------------------------------

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Transaction regression protection trigger function
CREATE OR REPLACE FUNCTION prevent_transaction_regression()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status IN ('completed', 'cancelled') AND NEW.status != OLD.status THEN
    RAISE EXCEPTION 'Cannot change status of a finalized transaction (status: %).', OLD.status;
  END IF;
  RETURN NEW;
END;
$$;


-- ------------------------------------------------------------------------------
-- DOMAIN 1: IDENTITY
-- ------------------------------------------------------------------------------

-- 1. profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name      TEXT NOT NULL,
  avatar_url        TEXT,
  phone             TEXT UNIQUE,
  phone_verified_at TIMESTAMPTZ,
  bio               TEXT CHECK (char_length(bio) <= 500),
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. communities
CREATE TABLE IF NOT EXISTS communities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  slug        TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  description TEXT CHECK (char_length(description) <= 1000),
  type        TEXT NOT NULL CHECK (type IN (
                'apartment','gated','hostel','college',
                'university','office','family','other'
              )),
  is_private  BOOLEAN NOT NULL DEFAULT TRUE,
  invite_code TEXT UNIQUE,
  created_by  UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  archived_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_communities_updated_at
  BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. community_members
CREATE TABLE IF NOT EXISTS community_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'member'
               CHECK (role IN ('member','moderator','admin','owner')),
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invited_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT uq_community_members UNIQUE (community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members (user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_comm ON community_members (community_id);

-- 4. community_invites
CREATE TABLE IF NOT EXISTS community_invites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  invited_by   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email        TEXT CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  phone        TEXT,
  token        TEXT NOT NULL UNIQUE,
  expires_at   TIMESTAMPTZ NOT NULL,
  accepted_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_invite_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);


-- ------------------------------------------------------------------------------
-- DOMAIN 2: CATALOG
-- ------------------------------------------------------------------------------

-- 5. categories
CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  parent_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  icon       TEXT,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE
);

-- 6. listings
CREATE TABLE IF NOT EXISTS listings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id     UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  owner_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  title            TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  description      TEXT CHECK (char_length(description) <= 2000),
  listing_type     TEXT NOT NULL CHECK (listing_type IN ('item','service')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('lend','rent','sell','service')),
  price_amount     NUMERIC(12,2) CHECK (price_amount >= 0),
  price_unit       TEXT CHECK (price_unit IN ('fixed','per_day','per_hour','negotiable')),
  quantity         INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  condition        TEXT CHECK (condition IN ('new','like_new','good','fair','poor')),
  status           TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','active','paused','unavailable','archived')),
  published_at     TIMESTAMPTZ,
  archived_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_listing_service_no_condition CHECK (
    listing_type <> 'service' OR condition IS NULL
  ),
  CONSTRAINT chk_listing_price_unit CHECK (
    price_amount IS NULL OR price_unit IS NOT NULL
  )
);

CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_listings_community_status ON listings (community_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings (owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings (category_id);

-- 7. listing_media
CREATE TABLE IF NOT EXISTS listing_media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url          TEXT NOT NULL,
  mime_type    TEXT,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. listing_availability
CREATE TABLE IF NOT EXISTS listing_availability (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  day_of_week  SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  time_from    TIME NOT NULL,
  time_to      TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_availability_times CHECK (time_from < time_to),
  CONSTRAINT uq_listing_availability UNIQUE (listing_id, day_of_week)
);


-- ------------------------------------------------------------------------------
-- DOMAIN 3: DEMAND
-- ------------------------------------------------------------------------------

-- 9. needs
CREATE TABLE IF NOT EXISTS needs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id      UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  requester_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
  title             TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  description       TEXT CHECK (char_length(description) <= 2000),
  need_type         TEXT NOT NULL CHECK (need_type IN ('borrow','rent','buy','service')),
  budget_min        NUMERIC(12,2) CHECK (budget_min >= 0),
  budget_max        NUMERIC(12,2) CHECK (budget_max >= 0),
  quantity          INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  needed_from       TIMESTAMPTZ,
  needed_until      TIMESTAMPTZ,
  status            TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open','in_progress','fulfilled','cancelled','expired')),
  expires_at        TIMESTAMPTZ,
  fulfillment_notes TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_needs_budget CHECK (
    budget_min IS NULL OR budget_max IS NULL OR budget_max >= budget_min
  ),
  CONSTRAINT chk_needs_dates CHECK (
    needed_from IS NULL OR needed_until IS NULL OR needed_until >= needed_from
  )
);

CREATE TRIGGER trg_needs_updated_at
  BEFORE UPDATE ON needs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_needs_community_status ON needs (community_id, status);
CREATE INDEX IF NOT EXISTS idx_needs_requester ON needs (requester_id);
CREATE INDEX IF NOT EXISTS idx_needs_type_status ON needs (need_type, status);
CREATE INDEX IF NOT EXISTS idx_needs_expires_at ON needs (expires_at) WHERE status = 'open';

-- 10. need_media
CREATE TABLE IF NOT EXISTS need_media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id      UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url          TEXT NOT NULL,
  mime_type    TEXT,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------------------------
-- DOMAIN 4: FULFILLMENT
-- ------------------------------------------------------------------------------

-- 11. offers
CREATE TABLE IF NOT EXISTS offers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id         UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  listing_id      UUID REFERENCES listings(id) ON DELETE SET NULL,
  provider_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  community_id    UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  message         TEXT CHECK (char_length(message) <= 1000),
  price_amount    NUMERIC(12,2) CHECK (price_amount >= 0),
  available_from  TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','accepted','rejected','withdrawn','expired')),
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_offers_need_provider UNIQUE (need_id, provider_id),
  CONSTRAINT chk_offer_availability CHECK (
    available_from IS NULL OR available_until IS NULL OR available_until >= available_from
  )
);

CREATE TRIGGER trg_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_offers_need_status ON offers (need_id, status);
CREATE INDEX IF NOT EXISTS idx_offers_provider ON offers (provider_id);

-- 12. transactions
CREATE TABLE IF NOT EXISTS transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id        UUID NOT NULL REFERENCES communities(id) ON DELETE RESTRICT,
  need_id             UUID REFERENCES needs(id) ON DELETE SET NULL,
  offer_id            UUID REFERENCES offers(id) ON DELETE SET NULL,
  listing_id          UUID REFERENCES listings(id) ON DELETE SET NULL,
  requester_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  provider_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  type                TEXT NOT NULL CHECK (type IN ('borrow','rent','buy','service')),
  agreed_amount       NUMERIC(12,2) CHECK (agreed_amount >= 0),
  platform_fee        NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
  currency            TEXT NOT NULL DEFAULT 'INR',
  status              TEXT NOT NULL DEFAULT 'requested'
                      CHECK (status IN (
                        'requested','accepted','confirmed','scheduled',
                        'in_progress','completed','cancelled','disputed'
                      )),
  scheduled_at        TIMESTAMPTZ,
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_transaction_parties CHECK (requester_id <> provider_id)
);

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_transaction_no_regression
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION prevent_transaction_regression();

-- Partial unique index: prevents multiple active transactions per need
CREATE UNIQUE INDEX IF NOT EXISTS uq_transactions_active_need
  ON transactions (need_id)
  WHERE status NOT IN ('cancelled');

CREATE INDEX IF NOT EXISTS idx_transactions_requester ON transactions (requester_id);
CREATE INDEX IF NOT EXISTS idx_transactions_provider ON transactions (provider_id);
CREATE INDEX IF NOT EXISTS idx_transactions_community ON transactions (community_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_need ON transactions (need_id);

-- 13. rental_details
CREATE TABLE IF NOT EXISTS rental_details (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id       UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
  pickup_location      TEXT,
  return_location      TEXT,
  deposit_amount       NUMERIC(12,2) CHECK (deposit_amount >= 0),
  condition_before     TEXT CHECK (condition_before IN ('new','like_new','good','fair','poor')),
  condition_after      TEXT CHECK (condition_after IN ('new','like_new','good','fair','poor')),
  actual_return_at     TIMESTAMPTZ,
  late_fee_amount      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (late_fee_amount >= 0),
  return_confirmed_at  TIMESTAMPTZ,
  return_confirmed_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_rental_details_updated_at
  BEFORE UPDATE ON rental_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 14. service_jobs
CREATE TABLE IF NOT EXISTS service_jobs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id   UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
  service_address  TEXT,
  scheduled_at     TIMESTAMPTZ,
  started_at       TIMESTAMPTZ,
  finished_at      TIMESTAMPTZ,
  job_status       TEXT NOT NULL DEFAULT 'scheduled'
                   CHECK (job_status IN (
                     'scheduled','en_route','in_progress',
                     'completed','cancelled','no_show'
                   )),
  customer_notes   TEXT,
  provider_notes   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_service_jobs_updated_at
  BEFORE UPDATE ON service_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ------------------------------------------------------------------------------
-- DOMAIN 5: COMMUNICATION
-- ------------------------------------------------------------------------------

-- 15. conversations
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id    UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  need_id         UUID REFERENCES needs(id) ON DELETE CASCADE,
  transaction_id  UUID REFERENCES transactions(id) ON DELETE CASCADE,
  title           TEXT CHECK (char_length(title) <= 200),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_conversation_single_context CHECK (
    NOT (need_id IS NOT NULL AND transaction_id IS NOT NULL)
  )
);

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_conversations_need ON conversations (need_id) WHERE need_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_txn ON conversations (transaction_id) WHERE transaction_id IS NOT NULL;

-- 16. conversation_participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at    TIMESTAMPTZ,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_conversation_participants UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON conversation_participants (user_id);

-- 17. messages
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body            TEXT CHECK (char_length(body) <= 4000),
  attachment_url  TEXT,
  attachment_type TEXT CHECK (attachment_type IN ('image','file','link')),
  is_system       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_message_content CHECK (body IS NOT NULL OR attachment_url IS NOT NULL)
);

CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, created_at DESC);


-- ------------------------------------------------------------------------------
-- DOMAIN 6: TRUST
-- ------------------------------------------------------------------------------

-- 18. reviews
CREATE TABLE IF NOT EXISTS reviews (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  reviewer_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating         SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT CHECK (char_length(comment) <= 1000),
  role           TEXT NOT NULL CHECK (role IN ('requester','provider')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_reviews_transaction_reviewer UNIQUE (transaction_id, reviewer_id),
  CONSTRAINT chk_reviews_parties CHECK (reviewer_id <> reviewee_id)
);

-- 19. disputes
CREATE TABLE IF NOT EXISTS disputes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  raised_by      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason         TEXT NOT NULL CHECK (char_length(reason) BETWEEN 10 AND 200),
  description    TEXT CHECK (char_length(description) <= 3000),
  status         TEXT NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open','under_review','resolved','closed')),
  resolution     TEXT,
  resolved_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_disputes_updated_at
  BEFORE UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 20. reports
CREATE TABLE IF NOT EXISTS reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('user','listing','need','message')),
  target_id   UUID NOT NULL,
  reason      TEXT NOT NULL CHECK (char_length(reason) BETWEEN 5 AND 200),
  description TEXT CHECK (char_length(description) <= 2000),
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','reviewed','actioned','dismissed')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ------------------------------------------------------------------------------
-- DOMAIN 7: FINANCIALS
-- ------------------------------------------------------------------------------

-- 21. payments
CREATE TABLE IF NOT EXISTS payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
  payer_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  payee_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount         NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency       TEXT NOT NULL DEFAULT 'INR',
  method         TEXT NOT NULL CHECK (method IN ('cash','online','deposit','platform')),
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','completed','failed','refunded','partially_refunded')),
  payment_type   TEXT NOT NULL DEFAULT 'payment'
                 CHECK (payment_type IN ('payment','deposit','refund','fee')),
  external_ref   TEXT,
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_payment_parties CHECK (payer_id <> payee_id)
);

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments (transaction_id);


-- ------------------------------------------------------------------------------
-- DOMAIN 8: PLATFORM
-- ------------------------------------------------------------------------------

-- 22. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL CHECK (char_length(title) <= 200),
  body       TEXT CHECK (char_length(body) <= 500),
  data       JSONB,
  channel    TEXT NOT NULL DEFAULT 'web' CHECK (channel IN ('web','email','push')),
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, created_at DESC)
  WHERE is_read = FALSE;

-- 23. saved_listings
CREATE TABLE IF NOT EXISTS saved_listings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_saved_listings UNIQUE (user_id, listing_id)
);

-- 24. saved_needs
CREATE TABLE IF NOT EXISTS saved_needs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  need_id    UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_saved_needs UNIQUE (user_id, need_id)
);

-- 25. audit_logs (append-only)
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   UUID,
  metadata    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
