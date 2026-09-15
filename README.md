# RentNest — Frontend 🏠

**"Find & List Rental Properties with Ease"**

A modern, fully responsive rental property marketplace built with **Next.js (App Router) +
TypeScript + Tailwind CSS**. Landlords list properties, tenants browse, request and pay via
**Stripe Checkout**, and admins moderate the whole platform — all against a real backend API.

> Assignment 5 — Programming Hero. Frontend-only build; the backend lives in a separate
> repository and is consumed over HTTP.

---

## 🔗 Links

| Item | Value |
|---|---|
| Live frontend | _https://rentnest-frontend-your-name.vercel.app_ ← update after Vercel deploy |
| Backend API | https://rent-nest-navy.vercel.app |
| Backend repo | _your backend repo URL_ |
| Demo video | _paste your 7–10 min Loom/Drive link_ |

## 🔑 Test credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@rentnest.com` | _your admin password_ |
| Tenant | register any account with role **Tenant** | — |
| Landlord | register any account with role **Landlord** | — |

> The backend blocks public ADMIN registration, so the admin account must be seeded directly
> in the database by the backend owner. Fill in the real email/password above before
> submitting, and test the login on the live site first.

---

## ✨ Features

### Public
- Responsive home page with hero search + featured properties (`next/image` optimized)
- Browse page with **advanced filters** (keyword, city, price range, property type,
  amenities) fully synced to URL params — shareable filter links
- Property details with image gallery/lightbox, amenities, landlord info, reviews
- Skeleton loaders everywhere, custom 404 and error boundaries, dark/light mode

### Tenant
- Register/login with role selection + inline validation
- Rental request flow with date validation and toasts
- Dashboard: request history with **status badges** (PENDING/APPROVED/REJECTED/ACTIVE/COMPLETED)
- **Stripe Checkout** payment: Pay Now → Stripe redirect → `/payment/success` (session
  confirmed via API) or `/payment/cancel`
- Payment history table + star review submission for completed rentals

### Landlord
- Dashboard with property stats and potential earnings
- Full property **CRUD**: create/edit forms with dynamic image URL inputs and amenity chips
- One-click availability toggle (optimistic UI)
- Incoming requests table with **Approve/Reject** (rejection reason modal, optimistic updates)

### Admin
- Platform overview: users, listings, requests with pending/banned sub-stats
- User management: search, role filter, pagination, **Ban/Unban** (optimistic)
- Content moderation tables for all listings and all rental requests

---

## 🛠️ Tech stack

- **Next.js 16 (App Router)** with Server/Client components
- **TypeScript** (strict)
- **Tailwind CSS v4** — custom design tokens, dark mode via `next-themes`
- **TanStack Query v5** — server state, mutations, optimistic updates
- **Zustand** (persisted) — auth/session state
- **Axios** — typed API client with normalized error handling
- **react-hot-toast**, **lucide-react**

## 🔐 Auth architecture

1. Login → backend sets an **httpOnly JWT cookie** (validated on every API call via
   `withCredentials: true`).
2. A non-sensitive `rn_session` flag cookie lets `src/middleware.ts` protect
   `/dashboard/*` and `/profile` at the edge.
3. A persisted **zustand** store mirrors `{ user, role }` for instant role-aware UI.
4. `RoleGuard` re-validates the session with `GET /api/auth/me` on every dashboard visit and
   blocks wrong-role access.

## 🚀 Getting started

```bash
npm install
cp .env.local.example .env.local   # or create it manually
npm run dev
```

`.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://rent-nest-navy.vercel.app
```

## 📦 Deploy to Vercel

1. Push to GitHub (this repo) → import in Vercel.
2. Add env var `NEXT_PUBLIC_API_BASE_URL=https://rent-nest-navy.vercel.app`.
3. Deploy — `npm run build` passes cleanly (verified).

## 📄 API mapping

See [API_INTEGRATION.md](./API_INTEGRATION.md) for the complete component → endpoint map.

## 🎥 Video script outline

1. Project overview & Next.js App Router architecture (30s)
2. Register tenant + landlord, login, middleware redirect demo (1 min)
3. Browse + filter properties, open details (1 min)
4. Tenant: submit request → landlord approves → Pay Now → Stripe test card
   `4242 4242 4242 4242` → success page → leave review (3 min)
5. Landlord: create listing with images/amenities, toggle availability, approve/reject
   with optimistic UI (2 min)
6. Admin: stats, ban/unban a user, moderation tables (1 min)
7. Challenge solved: middleware + RoleGuard + cookie-based auth, or the Stripe
   session_id confirmation round-trip (1 min)
