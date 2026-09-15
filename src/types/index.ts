export type UserRole = "ADMIN" | "LANDLORD" | "TENANT";

export type UserStatus = "ACTIVE" | "BANNED" | "BLOCKED";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  propertyId: string;
  tenantId: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
  updatedAt?: string;
  tenant?: User;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  price: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  amenities?: string[];
  images: string[];
  isAvailable: boolean;
  status?: string;
  categoryId: string;
  landlordId: string;
  createdAt?: string;
  updatedAt?: string;
  category?: Category;
  landlord?: User;
  reviews?: Review[];
}

export type RentalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACTIVE"
  | "COMPLETED";

export interface RentalRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  message?: string | null;
  startDate: string;
  endDate?: string | null;
  status: RentalStatus;
  rejectionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  property?: Property;
  tenant?: User;
  payment?: Payment | null;
}

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Payment {
  id: string;
  rentalRequestId: string;
  amount: number;
  currency: string;
  provider?: string;
  status: PaymentStatus;
  transactionId?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  rentalRequest?: RentalRequest;
}

export interface AuthUser extends User {
  // future profile fields (name, phone...) returned by /api/auth/me
  [key: string]: unknown;
}
