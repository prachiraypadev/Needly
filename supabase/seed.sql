-- ==============================================================================
-- NEEDLY SEED DATA
-- Development seed script for local testing.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SEED DEFAULT CATEGORIES
-- ------------------------------------------------------------------------------

INSERT INTO categories (id, name, slug, icon, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Tools & Home Improvement', 'tools', 'Wrench', 1),
  ('22222222-2222-2222-2222-222222222222', 'Electronics & Appliances', 'electronics', 'Tv', 2),
  ('33333333-3333-3333-3333-333333333333', 'Furniture & Decor', 'furniture', 'Armchair', 3),
  ('44444444-4444-4444-4444-444444444444', 'Events & Supplies', 'events', 'PartyPopper', 4),
  ('55555555-5555-5555-5555-555555555555', 'Local Help & Services', 'services', 'Handshake', 5)
ON CONFLICT (slug) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 2. SEED DEVELOPMENT AUTH USERS & PROFILES
-- Valid UUIDs matching auth.users
-- ------------------------------------------------------------------------------

-- User A: Rahul Sharma (Requester)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '00000000-0000-0000-0000-000000000000',
  'rahul.sharma@example.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGH',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"Rahul Sharma"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, display_name, avatar_url, phone, bio) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Rahul Sharma',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
  '+919876543210',
  'Resident of Block B-402. Happy to help neighbors.'
) ON CONFLICT (id) DO NOTHING;

-- User B: Priya Patel (Provider / Lender)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '00000000-0000-0000-0000-000000000000',
  'priya.patel@example.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGH',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"Priya Patel"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, display_name, avatar_url, phone, bio) VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'Priya Patel',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  '+919876543211',
  'Block C-101. DIY enthusiast with lots of power tools.'
) ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 3. SEED TEST COMMUNITY & MEMBERSHIPS
-- ------------------------------------------------------------------------------

INSERT INTO communities (id, name, slug, description, type, is_private, invite_code, created_by) VALUES (
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'Palm Meadows Residency',
  'palm-meadows',
  'Gated apartment society in Whitefield, Bengaluru.',
  'apartment',
  true,
  'PALM2026',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO community_members (community_id, user_id, role) VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'owner'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'member')
ON CONFLICT (community_id, user_id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 4. SEED SAMPLE LISTINGS & NEEDS
-- ------------------------------------------------------------------------------

-- Listing by Priya
INSERT INTO listings (id, community_id, owner_id, category_id, title, description, listing_type, transaction_type, price_amount, price_unit, status) VALUES (
  'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '11111111-1111-1111-1111-111111111111',
  'Bosch 18V Cordless Drill Kit',
  'Includes 2 batteries, charger, and 20-piece drill bit set.',
  'item',
  'lend',
  0,
  'fixed',
  'active'
) ON CONFLICT DO NOTHING;

-- Need by Rahul
INSERT INTO needs (id, community_id, requester_id, category_id, title, description, need_type, budget_min, budget_max, status) VALUES (
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '11111111-1111-1111-1111-111111111111',
  'Power Drill for Picture Hanging',
  'Need a cordless drill for 2 hours tomorrow morning to mount wall frames.',
  'borrow',
  0,
  0,
  'open'
) ON CONFLICT DO NOTHING;

-- Offer by Priya for Rahul's Need
INSERT INTO offers (id, need_id, listing_id, provider_id, community_id, message, price_amount, status) VALUES (
  'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'Hi Rahul, I have a Bosch 18V drill you can borrow anytime tomorrow!',
  0,
  'pending'
) ON CONFLICT (need_id, provider_id) DO NOTHING;
