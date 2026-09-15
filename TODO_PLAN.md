# RentNest Frontend — Build Plan & TODO

> **Live Backend API:** `https://rent-nest-navy.vercel.app`
> **Backend Source:** `../RentNest Server` (do NOT modify — frontend only)
> **Goal:** Fully satisfy Assignment 5 (RentNest) requirements, including the 6 mandatory items and 20+ meaningful commits.

---

## 0. Verified Backend API Contract (from `RentNest Server` source)

All responses use the envelope `{ success, message, data, meta? }`. Errors: `{ success: false, message, ... }`.

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/register` | POST | — | Register (`email`, `password`, `role`: `TENANT`/`LANDLORD`; ADMIN forbidden) |
| `/api/auth/login` | POST | — | Login → returns `accessToken` + `refreshToken` in body AND sets httpOnly cookies |
| `/api/auth/me` | GET/PATCH | all roles | Get / update current user |
| `/api/properties` | GET | public | List with filters: `search`, `location`, `city`, `minPrice`, `maxPrice`, `category`, `amenities[]` |
| `/api/properties/:id` | GET | public | Property details (includes category, landlord, reviews) |
| `/api/categories` | GET | public | Category list for filters/forms |
| `/api/landlords/properties` | GET/POST | LANDLORD | List own / create listing |
| `/api/landlords/properties/:id` | PUT | LANDLORD | Update listing |
| `/api/landlords/properties/:id/status` | PATCH | LANDLORD | Availability toggle |
| `/api/landlords/requests` | GET | LANDLORD | Incoming rental requests |
| `/api/landlords/requests/:id` | PATCH | LANDLORD | Approve/Reject (`status`, `rejectionReason`) |
| `/api/rentals` (POST `/:id`) | POST | TENANT | Submit rental request (`message`, `startDate`, `endDate`) |
| `/api/rentals` | GET | TENANT | My rental requests |
| `/api/rentals/:id` | GET | TENANT | Request detail |
| `/api/payments/create` | POST | TENANT | Create Stripe Checkout session → `{ payment, checkoutSession: { id, url } }` |
| `/api/payments/confirm` | POST | TENANT | Confirm by `sessionId` (called on `/payment/success`) |
| `/api/payments` | GET | TENANT | My payment history |
| `/api/payments/:id` | GET | TENANT | Payment details |
| `/api/reviews/:id` | POST | TENANT | Post review for property id (`rating`, `comment`) |
| `/api/admin/users` | GET | ADMIN | All users |
| `/api/admin/users/:id/status` | PATCH | ADMIN | Ban/Unban (`status`) |
| `/api/admin/properties` | GET | ADMIN | All listings |
| `/api/admin/rental-requests` | GET | ADMIN | All rental requests |

### Key backend constraints discovered
- **Auth token strategy:** backend reads JWT from `req.cookies.accessToken`. Login response ALSO returns tokens in the JSON body — the frontend will store them and rely on the `credentials: "include"` cookie for API calls (cookies are set cross-origin with `sameSite:none`).
- **Roles:** `TENANT`, `LANDLORD`, `ADMIN`. Users cannot register as ADMIN (API blocks it).
- **Rental statuses:** `PENDING`, `APPROVED`, `REJECTED`, `ACTIVE`, `COMPLETED` → color-coded badges.
- **Payment:** Stripe Checkout redirect flow. `POST /api/payments/create` → redirect to `checkoutSession.url`. Success URL carries `session_id` → `/payment/success` calls `POST /api/payments/confirm`. Rental becomes `COMPLETED` after payment → tenant can review.
- **Property create/update payload:** `title, description, location, city, price, categoryId, bedrooms, bathrooms, area, amenities[], images[]`.
- **Filters are query params** on `GET /api/properties`.

---

## 1. Mandatory Requirements Checklist (from Assignment README)

- [ ] **1. API Integration & Documentation** — consume ALL endpoints above + write `API_INTEGRATION.md` mapping components → endpoints.
- [ ] **2. Consistent UI Error Handling** — Toasts (success/error), inline form validation, React Error Boundaries, `error.tsx` + `not-found.tsx` pages.
- [ ] **3. Commits** — 20 meaningful frontend commits, conventional-commit style (tracked per phase below).
- [ ] **4. Admin Credentials** — working admin email/password delivered at the end (README section).
- [ ] **5. Payment Integration** — real Stripe Checkout redirect + `/payment/success` + `/payment/cancel` pages.
- [ ] **6. Video** — user records 7–10 min walkthrough (out of code scope; checklist in README).

Marks-focus: responsive UI, skeletons, dark/light mode (bonus), TanStack Query, Zustand/Context, Next.js Middleware role protection, full CRUD via UI, graceful 404/500.

---

## 2. Tech Stack (final decisions)

- **Next.js 15 (App Router) + TypeScript** (strict)
- **Tailwind CSS v4** + shadcn-style handcrafted UI components (no heavy UI kit dependency)
- **TanStack Query v5** for server state (mutations, optimistic updates, invalidation)
- **Zustand** for auth/user global state (persisted) — synced with cookie-based API auth
- **Axios instance** with `withCredentials` + typed API layer per module
- **next-themes** for dark/light mode
- **react-hot-toast** for notifications
- **next/image** everywhere, `loading.tsx` skeletons, `error.tsx` boundaries
- Deploy: **Vercel** (frontend repo: `Muzahidul-Islam-Zehad/RentNest_frontend`)

Route map (Next.js App Router):
```
/                                   Home (featured properties)
/properties                         Browse + advanced filters
/properties/[id]                    Details + reviews + Request to Rent
/properties/[id]/request            Rental request form (tenant only)
/auth/login, /auth/register         Auth pages
/dashboard/tenant                   Tenant overview (stats)
/dashboard/tenant/requests          Request history + status badges
/dashboard/tenant/requests/[id]/pay Payment initiation
/dashboard/tenant/payments          Payment history
/dashboard/landlord                 Landlord overview
/dashboard/landlord/properties      Property CRUD table
/dashboard/landlord/properties/new  Create form
/dashboard/landlord/properties/[id]/edit  Edit form
/dashboard/landlord/requests        Approve/Reject requests
/dashboard/admin                    Admin overview stats
/dashboard/admin/users              User management (ban/unban)
/dashboard/admin/properties         All listings (moderation)
/dashboard/admin/requests           All rental requests (moderation)
/payment/success, /payment/cancel   Stripe outcomes
/profile                            Update profile (PATCH /api/auth/me)
```

---

## 3. Phased Plan → 20 Commits

> Every phase ends with a commit + push to `origin/main`. Each commit is meaningful and conventional-commit formatted. Sequence is enforced so the repo always builds.

### Phase 0 — Project Setup  (→ Commit 1: this plan file)
- [x] `TODO_PLAN.md` with API contract, phases, commit mapping

### Phase 1 — Scaffold & Core Infrastructure  (Commit 2–5)
- [ ] **C2** `chore: scaffold next.js app router project with typescript and tailwind` — create-next-app inside `RentNest_Frontend`, clean template, gitignore, push.
- [ ] **C3** `feat: add typed api client with base url and credential handling` — `src/lib/api-client.ts` (axios instance, interceptors mapping backend envelope/errors).
- [ ] **C4** `feat: add domain types for user property rental payment and review` — `src/types/*.ts`.
- [ ] **C5** `feat: add theme provider toast provider and query provider` — layout providers, dark/light toggle, react-hot-toast, TanStack Query.

### Phase 2 — Authentication & Middleware Protection  (Commit 6–8)
- [ ] **C6** `feat: add zustand auth store with token persistence and hydration` — `src/store/auth-store.ts` (user, accessToken, login/logout actions, `GET /api/auth/me` sync).
- [ ] **C7** `feat: add login and register pages with validation and role selection` — `/auth/login`, `/auth/register` (TENANT/LANDLORD), inline errors + toasts.
- [ ] **C8** `feat: add middleware based route protection and role based redirects` — `src/middleware.ts` (JWT-ish session check via cookie/localStorage flag + role gates), `/dashboard` role router, `RoleGuard` client component.

### Phase 3 — Public Site  (Commit 9–11)
- [ ] **C9** `feat: add responsive navbar and footer with auth aware actions` — public shell, role-aware dashboard link, user menu.
- [ ] **C10** `feat: add home page with hero search and featured properties` — `GET /api/properties` featured grid, category chips.
- [ ] **C11** `feat: add property card skeleton and loading states` — reusable `PropertyCard`, skeletons, `loading.tsx`.
- [ ] **C12** `feat: add properties page with advanced filters and pagination-ready grid` — filter sidebar (search, city, price, category, amenities) synced to URL search params, `GET /api/properties` + `GET /api/categories`.
- [ ] **C13** `feat: add property details page with gallery landlord info and reviews` — `GET /api/properties/:id`, image gallery, sticky Request-to-Rent CTA (role-aware), 404 handling.

### Phase 4 — Tenant Experience & Stripe Payments  (Commit 14–16)
- [ ] **C14** `feat: add rental request flow with form validation and toasts` — `POST /api/rentals/:id` via `/properties/[id]/request`.
- [ ] **C15** `feat: add tenant dashboard with request history and status badges` — `GET /api/rentals`, badges per status, cancel-redirect safe links.
- [ ] **C16** `feat: add stripe checkout payment flow with success and cancel pages` — `POST /api/payments/create` → redirect; `/payment/success` confirms via `POST /api/payments/confirm` with `session_id`; `/payment/cancel` graceful page; payment history table `GET /api/payments`.
- [ ] **C17** `feat: add review submission for completed rentals` — `POST /api/reviews/:id` from tenant dashboard (COMPLETED requests).

### Phase 5 — Landlord Dashboard  (Commit 18–19)
- [ ] **C18** `feat: add landlord dashboard with property management crud` — `GET/POST/PUT /api/landlords/properties`, create/edit forms with dynamic image URL inputs + amenities chips, availability toggle `PATCH .../status`.
- [ ] **C19** `feat: add landlord request management with approve reject and optimistic updates` — `GET /api/landlords/requests`, `PATCH /api/landlords/requests/:id`, rejection reason modal, optimistic status update.

### Phase 6 — Admin Dashboard  (Commit 20–21)
- [ ] **C20** `feat: add admin dashboard with platform statistics overview` — `GET /api/admin/properties` + `/api/admin/rental-requests` + `/api/admin/users` aggregated stats cards.
- [ ] **C21** `feat: add admin user management table with ban unban actions` — `GET /api/admin/users`, search + pagination client-side, `PATCH /api/admin/users/:id/status`.
- [ ] **C22** `feat: add admin moderation views for listings and rental requests` — `GET /api/admin/properties`, `GET /api/admin/rental-requests` tables.

### Phase 7 — Hardening & Documentation  (Commit 23–24)
- [ ] **C23** `feat: add global error boundary not found page and profile update page` — root `error.tsx`, `not-found.tsx`, `/profile` with `PATCH /api/auth/me`, dashboard layout polish, empty states.
- [ ] **C24** `docs: add api integration mapping and deployment admin credentials` — `API_INTEGRATION.md` (component → endpoint map), README final (live URL, admin creds, setup), production build verification.

**Total: 24 commits planned (≥ 20 required).** Each phase: build → `npm run build` passes → commit → push `origin main`.

---

## 4. Error Handling Strategy (Mandatory #2)
- **Toasts:** every mutation success/error (`react-hot-toast`).
- **Inline validation:** all forms (login, register, request, property create/edit, review) with field-level messages.
- **API layer:** axios interceptor converts backend envelope errors → normalized `ApiError { status, message }`; 401 → auto-logout + redirect `/auth/login`.
- **Error boundaries:** route-level `error.tsx` (public + dashboard) with retry button.
- **404s:** `not-found.tsx` + graceful property-not-found on details page.

## 5. Data Fetching Rules
- Public reads: TanStack Query with URL-param-driven query keys (`['properties', filters]`).
- Dashboard reads: TanStack Query, staleTime 30s, refetch on window focus off.
- Mutations: TanStack `useMutation` + optimistic updates for approve/reject & ban/unban; invalidate on success.
- Auth state: Zustand (persisted) — single source of truth for `user`, `role`, `accessToken`.

## 6. Verification & Delivery Checklist
- [ ] `npm run build` green after every phase.
- [ ] All 5 mandatory items verified against live API before final push.
- [ ] Vercel deploy + env: `NEXT_PUBLIC_API_BASE_URL=https://rent-nest-navy.vercel.app`.
- [ ] Provide admin credentials (from backend seed) in final README + submission notes.
- [ ] 7–10 min video recorded by user (script outline included in final README).
