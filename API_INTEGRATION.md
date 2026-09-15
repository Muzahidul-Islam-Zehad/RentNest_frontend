# RentNest Frontend — API Integration Map

> **Backend base URL:** `https://rent-nest-navy.vercel.app` (set via `NEXT_PUBLIC_API_BASE_URL`)
> **Backend source:** `../RentNest Server` (untouched — this is a frontend-only project)

All requests go through `src/lib/api-client.ts` (axios, `withCredentials: true`) and the typed
service layer in `src/lib/api.ts`. The backend wraps every response as
`{ success, message, data, meta? }`; errors are normalized into `ApiError { status, message }`
and surfaced via toasts, inline form errors, or error boundaries.

---

## Authentication

| Endpoint | Method | Used by | Notes |
|---|---|---|---|
| `/api/auth/register` | POST | `RegisterForm` (`/auth/register`) | Body: `email`, `password`, `role` (`TENANT`/`LANDLORD`). ADMIN registration blocked by API. |
| `/api/auth/login` | POST | `LoginForm` (`/auth/login`) | Sets httpOnly `accessToken` cookie; response body also carries tokens which are stored in the zustand auth store. |
| `/api/auth/me` | GET | `RoleGuard`, `auth-store.syncUser`, `Navbar` | Re-validates the session, drives role-aware UI. |
| `/api/auth/me` | PATCH | `ProfilePage` (`/profile`) | Email update. |

**Auth strategy:** JWT lives in the backend's httpOnly cookie (sent automatically with
`withCredentials: true`). The frontend additionally stores the user object + access token in a
persisted zustand store for instant role-aware rendering, sets a `rn_session` flag cookie so
`src/middleware.ts` can guard `/dashboard/*` and `/profile` at the edge, and re-validates
through `GET /api/auth/me` on every dashboard visit via `RoleGuard`.

---

## Public

| Endpoint | Method | Used by |
|---|---|---|
| `/api/properties` | GET | `HomePage` (featured grid), `PropertiesContent` (`/properties`) with filters `search, city, location, minPrice, maxPrice, category, amenities[]` |
| `/api/properties/:id` | GET | Property details page (`/properties/[id]`) — gallery, amenities, landlord info, reviews |
| `/api/categories` | GET | Filter sidebar on `/properties`, category select in `PropertyForm` |

---

## Tenant

| Endpoint | Method | Used by |
|---|---|---|
| `/api/rentals/:propertyId` | POST | `RentalRequestPage` (`/properties/[id]/request`) — validated form (start/end date, message) |
| `/api/rentals` | GET | `TenantDashboard` overview + `TenantRequests` history with status badges and CTAs |
| `/api/rentals/:id` | GET | Available via `rentalsApi.getById` (request detail) |
| `/api/payments/create` | POST | `PaymentPage` (`/dashboard/tenant/requests/[id]/pay`) → redirects to `checkoutSession.url` (Stripe Checkout) |
| `/api/payments/confirm` | POST | `/payment/success` — confirms with the `session_id` query param returned by Stripe |
| `/api/payments` | GET | `TenantPayments` history table (`/dashboard/tenant/payments`) |
| `/api/payments/:id` | GET | Available via `paymentsApi.getById` |
| `/api/reviews/:propertyId` | POST | `ReviewPage` (`/dashboard/tenant/requests/[id]/review`) — star rating + comment, only for `COMPLETED` rentals |

**Payment flow:** Pay now → `POST /api/payments/create` → full-page redirect to Stripe
Checkout → Stripe returns to `/payment/success?session_id={CHECKOUT_SESSION_ID}` → frontend
calls `POST /api/payments/confirm` → rental becomes `COMPLETED`, UI invalidated. Cancellation
lands on `/payment/cancel` with graceful feedback.

---

## Landlord

| Endpoint | Method | Used by |
|---|---|---|
| `/api/landlords/properties` | GET | `LandlordDashboard` (stats + preview), `LandlordProperties` table, `EditProperty` lookup |
| `/api/landlords/properties` | POST | `PropertyForm` (`/dashboard/landlord/properties/new`) |
| `/api/landlords/properties/:id` | PUT | `PropertyForm` (edit mode, `/dashboard/landlord/properties/[id]/edit`) |
| `/api/landlords/properties/:id/status` | PATCH | `LandlordProperties` availability toggle (optimistic update) |
| `/api/landlords/requests` | GET | `LandlordRequests` — incoming requests table with tenant email, dates, message |
| `/api/landlords/requests/:id` | PATCH | `LandlordRequests` — Approve / Reject (with optional reason modal), optimistic badge update |

---

## Admin

| Endpoint | Method | Used by |
|---|---|---|
| `/api/admin/users` | GET | `AdminDashboard` stats, `AdminUsers` searchable + paginated table |
| `/api/admin/users/:id/status` | PATCH | `AdminUsers` Ban/Unban (optimistic update, ADMIN users protected) |
| `/api/admin/properties` | GET | `AdminDashboard` stats, `AdminProperties` moderation table |
| `/api/admin/rental-requests` | GET | `AdminDashboard` stats, `AdminRequests` moderation table |

---

## Error handling map

| Layer | Mechanism |
|---|---|
| Network / API errors | Axios interceptor → normalized `ApiError` → `react-hot-toast` on every mutation |
| Form validation | Field-level inline errors on login, register, rental request, property form, review |
| 401 (expired/invalid) | `RoleGuard` + `auth-store.syncUser` → auto-logout → redirect to `/auth/login` |
| 403 (wrong role) | `RoleGuard` access-denied card with link to correct dashboard |
| Route crashes | `src/app/error.tsx` boundary with retry button |
| Missing pages | `src/app/not-found.tsx` custom 404 |
| Missing data | Property details "not found" state, empty states in every table |
