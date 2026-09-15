# 🌟 NEEDLY — Poora Project Samjho (Complete Developer Guide)

> **Yeh guide kiske liye hai?** Naye developers ke liye jo is project ko pehli baar dekh rahe hain aur poora samajhna chahte hain — bina panic kiye!

---

## 📌 TABLE OF CONTENTS

1. [Project Kya Hai? (Big Picture)](#1-project-kya-hai)
2. [Tech Stack — Kaun Si Cheezein Use Ho Rahi Hain](#2-tech-stack)
3. [Folder Structure — Kahan Kya Hai](#3-folder-structure)
4. [Environment Variables (.env.local)](#4-environment-variables)
5. [Database Tables — Poori List](#5-database-tables)
6. [Authentication Flow — Login/Signup Kaise Kaam Karta Hai](#6-authentication-flow)
7. [Middleware (proxy.ts) — Route Guard Kaise Kaam Karta Hai](#7-middleware-proxyts)
8. [Backend Logic — Server Actions](#8-backend-logic--server-actions)
9. [Database Layer (lib/db) — Queries Kahan Likhein Hain](#9-database-layer)
10. [Frontend Pages — Kaunsa Page Kahan Hai](#10-frontend-pages)
11. [Components — Reusable UI Parts](#11-components)
12. [Data Flow — Ek Request Ka Poora Safar](#12-data-flow--ek-request-ka-poora-safar)
13. [Security — RLS (Row Level Security) Kya Hai](#13-security--rls)
14. [Validations — Zod Se Data Check](#14-validations--zod-se-data-check)
15. [Jab Aage Kaam Karna Ho — Quick Reference](#15-jab-aage-kaam-karna-ho)

---

## 1. Project Kya Hai?

**Needly** ek **community-based marketplace** hai — sochlo jaise apni society ya hostel ke andar WhatsApp group, but structured aur powerful.

### Real-Life Example:
> Tujhe kal drill machine chahiye ek ghante ke liye. Kharidna nahi chahti. Toh Needly pe jao, apni community mein "need" post karo: _"Drill machine chahiye, 1 ghanta, borrow karna hai"_. Koi neighbor jo woh machine dene ke liye tayaar hai, wo "offer" kar dega. Dono agree karte hain, transaction complete!

### Kya-Kya Ho Sakta Hai Needly Pe:
| Action | Matlab |
|--------|--------|
| **Borrow** | Kisi cheez ko kuch time ke liye lo, free mein |
| **Rent** | Kisi cheez ko kuch time ke liye lo, paisa dekar |
| **Buy** | Permanently kharid lo |
| **Service** | Kisi se kaam karwao (plumber, tutor, etc.) |

---

## 2. Tech Stack

> **Tech stack** matlab: kaun si technologies milake yeh project bana hai.

### Frontend (Jo User Dekh Ta Hai)
| Technology | Kya Karta Hai | Simple Explanation |
|------------|---------------|--------------------|
| **Next.js 16** | Web framework | Pura app ka base. React ka boss version. |
| **React 19** | UI library | Buttons, forms, pages — sab React mein banate hain |
| **TypeScript** | JavaScript + types | JavaScript mein galtiyan pakarne ka tool |
| **Tailwind CSS v4** | Styling | CSS likhne ka fast tarika, classes se design |
| **Geist Font** | Typography | Google ka font, Vercel ne banaya |
| **Lucide React** | Icons | Beautiful icons ki library |
| **Sonner** | Toast notifications | "Success!" ya "Error!" wale popups |

### Backend (Jo Server Pe Chalta Hai)
| Technology | Kya Karta Hai |
|------------|---------------|
| **Next.js Server Actions** | Forms submit hone pe server-side code run karta hai |
| **Next.js Server Components** | Page load hone pe directly database se data fetch |
| **Supabase** | Backend-as-a-Service (database + auth + storage) |

### Database
| Technology | Kya Karta Hai |
|------------|---------------|
| **Supabase (PostgreSQL)** | Poora data store hota hai yahan |
| **Row Level Security (RLS)** | Database level pe security rules |
| **SQL Migrations** | Database schema versioned files mein |

### Dev Tools
| Tool | Use |
|------|-----|
| **Zod** | Form data validate karna (type-safe) |
| **pnpm** | Package manager (npm se fast) |
| **ESLint** | Code quality check |

---

## 3. Folder Structure

```
Needly/
│
├── app/                          ← Pages (Routes)
│   ├── layout.tsx                ← Root layout (font, global CSS)
│   ├── globals.css               ← Global CSS styles
│   │
│   ├── (public)/                 ← Public pages (no login needed)
│   │   ├── page.tsx              ← Home page (landing page)
│   │   ├── login/                ← Login page
│   │   └── signup/               ← Signup page
│   │
│   ├── (authenticated)/          ← Protected pages (login ZARURI hai)
│   │   ├── layout.tsx            ← Auth check + header
│   │   ├── profile/              ← User profile page
│   │   ├── communities/          ← Community list + detail
│   │   ├── create-community/     ← New community banana
│   │   ├── join-community/       ← Community join karna
│   │   ├── listings/             ← Items/services ki list
│   │   ├── my-listings/          ← Meri listings
│   │   └── needs/                ← Community ki needs
│   │
│   └── auth/
│       └── callback/             ← Email verification ka return URL
│
├── components/                   ← Reusable UI Components
│   ├── layout/
│   │   ├── app-header.tsx        ← Top navigation bar (after login)
│   │   ├── header.tsx            ← Public header (before login)
│   │   └── footer.tsx            ← Footer
│   ├── auth/                     ← Login/signup forms
│   ├── community/                ← Community related UI
│   ├── listings/                 ← Listing cards, forms
│   ├── needs/                    ← Needs related UI
│   ├── profile/                  ← Profile UI
│   └── ui/                       ← Base UI (buttons, inputs)
│
├── lib/                          ← App Logic (Brain)
│   ├── actions/                  ← Server Actions (form submit handlers)
│   │   ├── auth.ts               ← signUp, signIn, signOut
│   │   ├── community.ts          ← createCommunity, joinCommunity
│   │   ├── listings.ts           ← createListing, updateListing
│   │   ├── needs.ts              ← createNeed, updateNeed
│   │   └── profile.ts            ← Profile update
│   │
│   ├── auth/
│   │   └── dal.ts                ← Data Access Layer (session verify)
│   │
│   ├── db/
│   │   └── listings.ts           ← Database queries for listings
│   │
│   ├── supabase/
│   │   ├── client.ts             ← Browser-side Supabase client
│   │   └── server.ts             ← Server-side Supabase client
│   │
│   ├── types/
│   │   ├── database.types.ts     ← Auto-generated DB types
│   │   └── domain.ts             ← App-level TypeScript types
│   │
│   ├── validations/              ← Zod validation schemas
│   │   ├── auth.ts
│   │   ├── community.ts
│   │   ├── listing.ts
│   │   └── need.ts
│   │
│   ├── constants/                ← App-wide constants
│   └── utils/
│       └── cn.ts                 ← CSS class merge helper
│
├── supabase/                     ← Database
│   ├── config.toml               ← Supabase local config
│   ├── seed.sql                  ← Starting data (categories, etc.)
│   └── migrations/               ← DB schema change files
│       ├── 20260827000000_schema_v2.sql     ← All 25 tables
│       ├── 20260827000001_atomic_procedures.sql  ← DB functions
│       ├── 20260827000002_rls_policies.sql  ← Security rules
│       ├── 20260828000003_profile_trigger.sql    ← Auto-create profile
│       └── 20260828000004_community_procedures.sql
│
├── proxy.ts                      ← Middleware (route protection)
├── .env.local                    ← API keys (secret! never commit)
├── .env.example                  ← .env ka template (safe to commit)
├── package.json                  ← Dependencies list
└── next.config.ts                ← Next.js config
```

---

## 4. Environment Variables

> **Environment variables** matlab: secret keys aur settings jo `.env.local` file mein hoti hain. Yeh git mein **KABHI** commit nahi hoti (secrets hain!).

```bash
# Supabase ka public URL — safe hai browser mein bhi
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"

# Supabase ka anonymous key — RLS se protected hai
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJh..."

# Service Role Key — SUPER SECRET! Sirf server pe use karo
# Yeh RLS bypass kar sakta hai, isliye kabhi browser ko mat do
SUPABASE_SERVICE_ROLE_KEY="eyJh..."

# JWT Secret — tokens verify karne ke liye
SUPABASE_JWT_SECRET="super-secret"

# App ka URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### NEXT_PUBLIC_ prefix kya hota hai?
- **`NEXT_PUBLIC_`** se start hone wali variables → Browser mein bhi available hoti hain
- **Bina prefix** ke variables → Sirf server pe available hoti hain (zyada secure)

---

## 5. Database Tables

> Database mein **25 tables** hain, **8 domains** mein divide hain.

### Domain 1: Identity (Kaun Hai User)

#### `profiles` — User ka profile
| Column | Type | Matlab |
|--------|------|--------|
| `id` | UUID | User ka unique ID (Supabase auth se linked) |
| `display_name` | TEXT | Naam jo dikhega |
| `avatar_url` | TEXT | Profile picture ka URL |
| `phone` | TEXT | Phone number (unique) |
| `bio` | TEXT | Apne baare mein (max 500 chars) |
| `is_active` | BOOLEAN | Account active hai ya nahi |

> **Note:** `profiles` table automatically banti hai jab koi signup karta hai — ek **database trigger** (`handle_new_user`) chalti hai automatically!

#### `communities` — Group/Society
| Column | Type | Matlab |
|--------|------|--------|
| `id` | UUID | Community ka unique ID |
| `name` | TEXT | Community ka naam |
| `slug` | TEXT | URL-friendly naam (e.g., "my-society-ab12") |
| `type` | TEXT | apartment/hostel/college/office etc. |
| `is_private` | BOOLEAN | Private community? Invite se hi join ho |
| `invite_code` | TEXT | Join karne ka code (e.g., "NEED-XY3Z") |
| `created_by` | UUID | Kisne banaya (profile ID) |

#### `community_members` — Kaun Community Mein Hai
| Column | Type | Matlab |
|--------|------|--------|
| `community_id` | UUID | Kaunsi community |
| `user_id` | UUID | Kaun member hai |
| `role` | TEXT | member / moderator / admin / owner |

#### `community_invites` — Targeted Invites
| Column | Type | Matlab |
|--------|------|--------|
| `token` | TEXT | Unique invite link token |
| `email` / `phone` | TEXT | Kisko invite kiya |
| `expires_at` | TIMESTAMPTZ | Kab tak valid (7 days) |
| `accepted_at` | TIMESTAMPTZ | Kab accept kiya (null = pending) |

---

### Domain 2: Catalog (Kya Available Hai)

#### `categories` — Item Categories
| Column | Matlab |
|--------|--------|
| `name` | Category ka naam (Tools, Electronics, etc.) |
| `slug` | URL-friendly naam |
| `parent_id` | Sub-category ke liye (parent category) |
| `icon` | Icon ka naam |

#### `listings` — Jo Dena/Bechna/Kiraye Pe Dena Hai
| Column | Type | Matlab |
|--------|------|--------|
| `title` | TEXT | Listing ka naam |
| `listing_type` | TEXT | `item` ya `service` |
| `transaction_type` | TEXT | `lend` / `rent` / `sell` / `service` |
| `price_amount` | NUMERIC | Kitna paisa |
| `price_unit` | TEXT | `fixed` / `per_day` / `per_hour` / `negotiable` |
| `condition` | TEXT | `new` / `like_new` / `good` / `fair` / `poor` |
| `status` | TEXT | `draft` / `active` / `paused` / `archived` |
| `owner_id` | UUID | Kisne post kiya |
| `community_id` | UUID | Kaunsi community mein visible hai |

#### `listing_media` — Listing Ki Photos
| Column | Matlab |
|--------|--------|
| `listing_id` | Kaunsi listing ki photo |
| `url` | Photo ka URL |
| `sort_order` | Konsa pehle dikhega |

#### `listing_availability` — Kab Available Hai
| Column | Matlab |
|--------|--------|
| `listing_id` | Kaunsi listing |
| `day_of_week` | 0=Sunday, 6=Saturday |
| `time_from` / `time_to` | Available time range |

---

### Domain 3: Demand (Kya Chahiye)

#### `needs` — Jo Chahiye Community Se
| Column | Type | Matlab |
|--------|------|--------|
| `title` | TEXT | Need ka naam |
| `need_type` | TEXT | `borrow` / `rent` / `buy` / `service` |
| `budget_min` / `budget_max` | NUMERIC | Budget range |
| `needed_from` / `needed_until` | TIMESTAMPTZ | Kab chahiye |
| `status` | TEXT | `open` / `in_progress` / `fulfilled` / `cancelled` |
| `requester_id` | UUID | Kisne post kiya |

#### `need_media` — Need Ki Photos
Same as `listing_media` but need ke liye.

---

### Domain 4: Fulfillment (Deal Kaise Hoti Hai)

#### `offers` — Provider Ka Response
> Jab koi need post hoti hai aur kisi ke paas woh cheez hai, wo "offer" karta hai.

| Column | Matlab |
|--------|--------|
| `need_id` | Kaunsi need pe offer hai |
| `provider_id` | Kaunsa user offer kar raha |
| `price_amount` | Offer ka price |
| `status` | `pending` / `accepted` / `rejected` / `withdrawn` |

#### `transactions` — Final Deal
| Column | Matlab |
|--------|--------|
| `requester_id` | Jo chahiye tha usse |
| `provider_id` | Jo diya usne |
| `type` | borrow/rent/buy/service |
| `agreed_amount` | Agree hua amount |
| `status` | requested → accepted → confirmed → in_progress → completed |

#### `rental_details` — Rent Ki Extra Info
Sirf rent transactions ke liye: deposit, condition before/after, return date.

#### `service_jobs` — Service Ki Extra Info
Sirf service transactions ke liye: address, schedule, job status.

---

### Domain 5: Communication (Baat-cheet)

#### `conversations` — Chat Threads
#### `conversation_participants` — Chat Mein Kaun
#### `messages` — Individual Messages
| Column | Matlab |
|--------|--------|
| `body` | Message text |
| `attachment_url` | File/image attachment |
| `is_system` | System message (auto-generated, like "Transaction completed") |

---

### Domain 6: Trust (Bharosa)

#### `reviews` — Rating System (1-5 Stars)
Transaction complete hone ke baad dono side review kar sakte hain.

#### `disputes` — Agar Kuch Galat Hua
Community admin ke through resolve hota hai.

#### `reports` — Flag Content
User/listing/need/message ko report kar sakte hain.

---

### Domain 7: Financials (Paisa)

#### `payments` — Payment Records
| Column | Matlab |
|--------|--------|
| `method` | `cash` / `online` / `deposit` / `platform` |
| `status` | pending / completed / failed / refunded |
| `payment_type` | payment / deposit / refund / fee |

---

### Domain 8: Platform

#### `notifications` — User Notifications
Web/email/push notifications track karna.

#### `saved_listings` — Bookmarked Listings
#### `saved_needs` — Bookmarked Needs
#### `audit_logs` — Sab Kuch Record (Append-only)
Security ke liye — kisi ne kya kiya track karta hai.

---

## 6. Authentication Flow

### Signup Flow (Naya User)

```
User fills form
      ↓
signUp() Server Action (lib/actions/auth.ts)
      ↓
Zod validate karo
      ↓
supabase.auth.signUp() call
      ↓
Email verification bheja (agar on hai)
      ↓
User email click karta hai → /auth/callback route
      ↓
Database trigger (handle_new_user) chalti hai AUTOMATICALLY
      ↓
profiles table mein row insert ho jaati hai
      ↓
Redirect → /profile
```

### Login Flow

```
User fills email + password
      ↓
signIn() Server Action
      ↓
supabase.auth.signInWithPassword()
      ↓
Auth session cookie set hota hai browser mein
      ↓
Redirect → /profile
```

### Logout Flow

```
User clicks logout
      ↓
signOut() Server Action
      ↓
supabase.auth.signOut()
      ↓
Redirect → /
```

### Session Check (Har Protected Page Pe)

```
User koi page kholti hai
      ↓
proxy.ts (edge mein) check karta hai — FAST!
      ↓ (agar session nahi)
/login pe redirect → Done
      ↓ (agar session hai, page render start)
verifySession() (dal.ts) phir se check karta hai — AUTHORITATIVE!
```

> **Double check kyun?**
> `proxy.ts` fast hai (edge pe chalta hai) lekin 100% reliable nahi.
> `verifySession()` in `dal.ts` real security boundary hai jo Supabase ke server se JWT verify karta hai.

---

## 7. Middleware (proxy.ts)

**File:** `proxy.ts`

> **Middleware** matlab: Har request se pehle chalne wala code. Like a security guard at the door!

### Route Types:
```
Protected Routes (login zaruri):
  /profile, /communities, /create-community,
  /join-community, /needs, /listings, /my-listings

Auth Routes (logged-in user ko yahan mat jaane do):
  /login, /signup

Always Public:
  /auth/callback, /about, /how-it-works
```

### Logic:
```
Request aata hai
      ↓
Session cookies se user check karo
      ↓
Protected route + Not logged in? → /login redirect
Auth route + Logged in? → /profile redirect
Baaki sab? → Request through jaane do
```

---

## 8. Backend Logic — Server Actions

> **Server Actions** Next.js ka feature hai. Form submit hone pe yeh functions **server pe** chalte hain. Data safely database tak jaata hai.

> Har action file ke upar `"use server";` likha hota hai — yeh batata hai ki yeh code sirf server pe chalega.

### `lib/actions/auth.ts`

| Function | Kya Karta Hai |
|----------|---------------|
| `signUp(formData)` | New user register karta hai |
| `signIn(formData)` | Login karta hai |
| `signOut()` | Logout karta hai |

---

### `lib/actions/community.ts`

| Function | Kya Karta Hai |
|----------|---------------|
| `createCommunity(formData)` | Naya community banata hai + creator ko owner banata hai |
| `joinCommunity(formData)` | Invite code se community join karta hai |
| `createInvite(formData)` | Targeted invite token generate karta hai (7 din valid) |

**`createCommunity` ka step-by-step:**
```
1. verifySession() — kya user logged in hai?
2. Form validate karo (Zod)
3. Slug generate karo (e.g., "my-society-ab12")
4. Invite code generate karo (e.g., "NEED-XY3Z")
5. DB RPC call: create_community_with_owner()
   (agar RPC nahi milti — fallback: direct insert)
6. communities table mein INSERT
7. community_members mein owner ke roop mein INSERT
8. revalidatePath("/communities") — cache clear
9. redirect("/communities/[newId]")
```

**`joinCommunity` ka step-by-step:**
```
1. verifySession()
2. Invite code validate karo
3. communities.invite_code mein search karo (general code)
4. Agar nahi mila → community_invites.token mein search karo
5. Agar expired ya invalid → error return
6. Agar already member hai → skip (idempotent!)
7. community_members mein INSERT
8. Agar targeted invite tha → accepted_at UPDATE
9. redirect("/communities/[id]")
```

---

### `lib/actions/listings.ts`

| Function | Kya Karta Hai |
|----------|---------------|
| `createListing(formData)` | Naya listing post karo |
| `updateListing(formData)` | Listing edit karo |
| `pauseListing(id)` | Listing pause karo |
| `resumeListing(id)` | Listing fir active karo |
| `archiveListing(id)` | Permanently hide karo |

**`createListing` ka step-by-step:**
```
1. verifySession()
2. media_urls (JSON array) parse karo
3. availability_slots (JSON array) parse karo
4. Zod validate karo
5. Check: kya user is community ka member hai?
6. listings table mein INSERT (status: "active")
7. listing_media INSERT (agar photos hain)
8. listing_availability INSERT (agar time slots hain)
9. revalidatePath("/listings") aur "/my-listings"
10. redirect("/listings/[newId]")
```

---

### `lib/actions/needs.ts`

| Function | Kya Karta Hai |
|----------|---------------|
| `createNeed(formData)` | Naya need post karo |
| `updateNeed(formData)` | Need edit karo |
| `cancelNeed(needId)` | Need cancel karo |
| `markNeedFulfilled(needId)` | Need fulfilled mark karo |

---

## 9. Database Layer

### `lib/auth/dal.ts` — Session Verification

| Function | Kya Karta Hai |
|----------|---------------|
| `verifySession()` | Session verify karo, agar nahi → /login. React `cache()` se memoize. |
| `getSessionUser()` | Session user return ya null (redirect nahi karta) |

> **React `cache()` kya hai?**
> Agar ek hi page render mein yeh function multiple baar call ho, toh sirf ek baar Supabase ko call hoga. Performance optimization!

### `lib/db/listings.ts` — Listing Queries

| Function | Kya Karta Hai |
|----------|---------------|
| `getCommunityListings(communityId, userId, filters?)` | Community ke active listings |
| `getUserListings(userId, statusFilter?)` | Meri sab listings |
| `getListingById(listingId, userId)` | Ek listing ka poora detail |
| `getCategories()` | Sab categories |

> Sab functions `cache()` mein wrap hain — same request mein duplicate DB calls avoid!

---

## 10. Frontend Pages

### Public Pages (Login Nahi Chahiye)
| Route | Kya Hai |
|-------|---------|
| `/` | Landing/Home page |
| `/login` | Login form |
| `/signup` | Signup form |
| `/auth/callback` | Email verification return |

### Protected Pages (Login Chahiye)
| Route | Kya Hai |
|-------|---------|
| `/profile` | User ka profile |
| `/communities` | Sab communities list |
| `/communities/[id]` | Community detail page |
| `/create-community` | Naya community banao |
| `/join-community` | Code se join karo |
| `/listings` | Sab listings |
| `/listings/[id]` | Ek listing ka detail |
| `/my-listings` | Meri sab listings |
| `/needs` | Community ki needs |
| `/needs/[id]` | Ek need ka detail |

---

## 11. Components

### `lib/supabase/client.ts` vs `lib/supabase/server.ts`

| | `client.ts` | `server.ts` |
|---|-------------|-------------|
| Kahan use hoga | Browser (React components) | Server (Server Components, Actions) |
| Kaise kaam karta | Cookies se (browser) | HTTP-only cookies se (secure) |
| Use case | Realtime subscriptions | Auth verify, DB queries |

> **Warning:** Service Role Key kabhi `client.ts` mein use mat karo! Woh RLS bypass karta hai.

### `lib/utils/cn.ts` — CSS Class Helper

```typescript
// clsx + tailwind-merge ka combination
// Conflicting Tailwind classes resolve karta hai
cn("px-4 py-2", isActive && "bg-blue-500", "px-2")
// → "py-2 bg-blue-500 px-2" (px-4 hata diya)
```

---

## 12. Data Flow — Ek Request Ka Poora Safar

### Example: User "Drill Machine" Need Post Karta Hai

```
STEP 1: USER
Browser mein form fill karta hai:
- Title: "Drill Machine Chahiye"
- Need Type: "borrow"
- Community: "My Society"
         |
         | Form submit
         ↓

STEP 2: proxy.ts (Edge Middleware)
- /needs/* → protected route check
- Cookie se session verify
- Logged in? → request through
         |
         ↓

STEP 3: lib/actions/needs.ts → createNeed()
- verifySession() → JWT server se verify
- Zod validate karo sab fields
- DB check → kya user community member hai?
- needs table mein INSERT
- revalidatePath("/needs")
- redirect("/needs/[newNeedId]")
         |
         ↓

STEP 4: Supabase (PostgreSQL)
- RLS check: kya user community member hai?
- needs table mein row insert
- updated_at trigger chalti hai automatically
- New ID return
         |
         ↓

STEP 5: BROWSER
/needs/[id] pe redirect
- Server Component: verifySession() phir
- Need data fetch
- Page render with data
```

### GET vs POST Ka Tarika

> Needly mein traditional REST API (`/api/...` routes) nahi hain. Next.js Server Actions aur Server Components use hote hain.

**Data fetch (GET jaise):**
```typescript
// Server Component (page.tsx)
import { getCommunityListings } from "@/lib/db/listings"

export default async function ListingsPage() {
  const { userId } = await verifySession()
  const listings = await getCommunityListings(communityId, userId)
  return <div>{/* render listings */}</div>
}
```

**Data mutate (POST jaise):**
```typescript
// Form mein action prop
<form action={createNeed}>
  <input name="title" />
  <button type="submit">Post Need</button>
</form>
// Submit hone pe createNeed() server pe chalti hai
```

---

## 13. Security — RLS

**File:** `supabase/migrations/20260827000002_rls_policies.sql`

> **RLS (Row Level Security)** matlab: Database level pe rules jo decide karte hain kaun kaunsa data dekh sakta hai ya change kar sakta hai.

### Example RLS Rule:
```sql
-- Listings sirf community members dekh sakte hain
-- Sirf owner ya admin update kar sakta hai
```

### 3 Security Layers:
```
Layer 1: proxy.ts
  → Edge pe fast check (cookies se)
  → First line of defense

Layer 2: verifySession() (dal.ts)
  → Server pe JWT verify (Supabase ke saath)
  → Authoritative security boundary

Layer 3: RLS Policies (Supabase)
  → Database row level check
  → Deepest layer — even if code has bugs
```

> **3 layers kyun?** Koi ek layer bypass ho sakti hai, lekin teeno ek saath bypass karna bahut mushkil hai!

---

## 14. Validations — Zod Se Data Check

**File:** `lib/validations/community.ts`

> **Zod** ek library hai jo form data ko validate karta hai — ensure karta hai ki sab sahi format mein hai database mein jaane se pehle.

### Example:
```typescript
CreateCommunitySchema = z.object({
  name: z.string().min(2).max(100),           // naam 2-100 chars
  type: z.enum(["apartment", "hostel", ...]), // sirf yeh values allowed
  description: z.string().max(1000).optional(), // optional, max 1000
  is_private: z.boolean().default(true),       // default true
})

// Use:
const result = CreateCommunitySchema.safeParse(formData)
if (!result.success) {
  return { errors: result.error.flatten().fieldErrors }
  // errors = { name: ["Too short"], type: ["Invalid"] }
}
```

---

## 15. Jab Aage Kaam Karna Ho — Quick Reference

### Nayi Protected Page Add Karni Ho:
```
1. app/(authenticated)/new-page/page.tsx banao
2. proxy.ts → PROTECTED_PREFIXES mein add karo
3. Data ke liye lib/db/ mein function banao
4. Mutations ke liye lib/actions/ mein function banao
```

### Nayi Server Action Template:
```typescript
"use server"; // Hamesha pehli line

import { verifySession } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function myAction(formData: FormData) {
  // Step 1: Auth check
  const { userId } = await verifySession();
  
  // Step 2: Validate
  const raw = { title: formData.get("title") };
  // ...Zod schema.safeParse(raw)...
  
  // Step 3: Authorization check (optional)
  // ...check permissions in DB...
  
  // Step 4: DB mutation
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("table_name")
    .insert({ field: value, created_by: userId });
  
  if (error) return { message: "Failed!" };
  
  // Step 5: Revalidate + redirect
  revalidatePath("/some-path");
  redirect("/new-page");
}
```

### Data Fetch Karna (Server Component mein):
```typescript
import { verifySession } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export default async function MyPage() {
  const { userId } = await verifySession();
  const supabase = await createClient();
  
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", userId);
  
  return <div>{/* render data */}</div>;
}
```

---

## Summary Table — Ek Line Mein Sab Kuch

| Cheez | Kahan Dekho |
|-------|-------------|
| Database tables (schema) | `supabase/migrations/20260827000000_schema_v2.sql` |
| Auth login/logout | `lib/actions/auth.ts` |
| Session verify | `lib/auth/dal.ts` |
| Form validations | `lib/validations/` |
| Supabase client | `lib/supabase/` |
| Page routes | `app/` |
| UI components | `components/` |
| Data fetch queries | `lib/db/` |
| Mutations (create/update) | `lib/actions/` |
| Route protection | `proxy.ts` |
| Security rules (RLS) | `supabase/migrations/20260827000002_rls_policies.sql` |
| API keys config | `.env.local` |
| Auto profile creation | `supabase/migrations/20260828000003_profile_trigger.sql` |

---

> **Pro Tip:** Jab bhi koi naya feature samajhna ho, pehle `lib/actions/` mein us feature ka action file dekho. Phir `supabase/migrations/` mein us feature ki table dekho. Poora picture clear ho jaayega!

---

*Guide banai gayi: September 2026 | Project: Needly v2.0*
