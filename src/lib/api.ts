import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/api-client";
import type { AuthUser, Category, Payment, Property, RentalRequest, Review } from "@/types";

/* ---------------------------------- Auth ---------------------------------- */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: "TENANT" | "LANDLORD";
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiPost<{ accessToken: string; refreshToken: string }>("/api/auth/login", payload),

  register: (payload: RegisterPayload) =>
    apiPost<AuthUser>("/api/auth/register", payload),

  me: () => apiGet<AuthUser>("/api/auth/me"),

  updateMe: (payload: { email?: string }) => apiPatch<AuthUser>("/api/auth/me", payload),
};

/* -------------------------------- Properties ------------------------------- */

export interface PropertyFilters {
  search?: string;
  location?: string;
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  category?: string;
  amenities?: string[];
}

export interface PropertyListingPayload {
  title: string;
  description: string;
  location: string;
  city: string;
  price: number;
  categoryId: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  amenities?: string[];
  images: string[];
}

export const propertiesApi = {
  list: (filters?: PropertyFilters) =>
    apiGet<Property[]>("/api/properties", {
      search: filters?.search || undefined,
      location: filters?.location || undefined,
      city: filters?.city || undefined,
      minPrice: filters?.minPrice || undefined,
      maxPrice: filters?.maxPrice || undefined,
      category: filters?.category || undefined,
      amenities: filters?.amenities?.length ? filters.amenities : undefined,
    }),

  getById: (id: string) => apiGet<Property>(`/api/properties/${id}`),
};

/* -------------------------------- Categories ------------------------------- */

export const categoriesApi = {
  list: () => apiGet<Category[]>("/api/categories"),
};

/* --------------------------- Landlord (properties) ------------------------- */

export const landlordApi = {
  myProperties: () => apiGet<Property[]>("/api/landlords/properties"),

  createProperty: (payload: PropertyListingPayload) =>
    apiPost<Property>("/api/landlords/properties", payload),

  updateProperty: (id: string, payload: Partial<PropertyListingPayload>) =>
    apiPut<Property>(`/api/landlords/properties/${id}`, payload),

  // Backend PATCH /landlords/properties/:id/status expects { status } with
  // propertyStatus enum values; isAvailable is derived server-side from it.
  updatePropertyStatus: (id: string, isAvailable: boolean) =>
    apiPatch<Property>(`/api/landlords/properties/${id}/status`, {
      status: isAvailable ? "ACTIVE" : "RENTED",
    }),

  // NOTE: returns Property[] each with nested rentalRequests[] (backend shape),
  // not a flat RentalRequest[] — useLandlordRequests flattens it.
  myRequests: () => apiGet<Property[]>("/api/landlords/requests"),

  updateRequestStatus: (id: string, status: "APPROVED" | "REJECTED", rejectionReason?: string) =>
    apiPatch<RentalRequest>(`/api/landlords/requests/${id}`, {
      status,
      rejectionReason: rejectionReason || undefined,
    }),
};

/* --------------------------------- Rentals --------------------------------- */

export interface RentalRequestPayload {
  message?: string;
  startDate: string;
  endDate?: string;
}

export const rentalsApi = {
  submit: (propertyId: string, payload: RentalRequestPayload) =>
    apiPost<RentalRequest>(`/api/rentals/${propertyId}`, payload),

  myRequests: () => apiGet<RentalRequest[]>("/api/rentals"),

  getById: (id: string) => apiGet<RentalRequest>(`/api/rentals/${id}`),
};

/* -------------------------------- Payments --------------------------------- */

export interface CreatePaymentResult {
  payment: Payment;
  checkoutSession: {
    id: string;
    url: string;
    payment_status?: string;
  };
}

export const paymentsApi = {
  createSession: (rentalRequestId: string) =>
    apiPost<CreatePaymentResult>("/api/payments/create", { rentalRequestId }),

  confirm: (sessionId: string) =>
    apiPost<Payment>("/api/payments/confirm", { sessionId }),

  myPayments: () => apiGet<Payment[]>("/api/payments"),

  getById: (id: string) => apiGet<Payment>(`/api/payments/${id}`),
};

/* --------------------------------- Reviews --------------------------------- */

export const reviewsApi = {
  post: (propertyId: string, payload: { rating: number; comment?: string }) =>
    apiPost<Review>(`/api/reviews/${propertyId}`, payload),
};

/* ---------------------------------- Admin ---------------------------------- */

export const adminApi = {
  users: () => apiGet<AuthUser[]>("/api/admin/users"),

  updateUserStatus: (id: string, status: "ACTIVE" | "BANNED") =>
    apiPatch<AuthUser>(`/api/admin/users/${id}/status`, { status }),

  properties: () => apiGet<Property[]>("/api/admin/properties"),

  rentalRequests: () => apiGet<RentalRequest[]>("/api/admin/rental-requests"),
};
