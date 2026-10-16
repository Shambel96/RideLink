// Backend Data Contracts and Types for RideLink

export type UserRole = 'PASSENGER' | 'DRIVER' | 'ADMIN';

export type DriverVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type DriverAvailabilityStatus = 'OFFLINE' | 'AVAILABLE' | 'BUSY';

export type RideStatus =
  | 'REQUESTED'
  | 'SEARCHING'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type VehicleType = 'SEDAN' | 'SUV' | 'HATCHBACK' | 'MINIVAN' | 'MOTORCYCLE';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt?: string;
  driver?: {
    id: string;
    verificationStatus: DriverVerificationStatus;
    availabilityStatus?: DriverAvailabilityStatus;
  } | null;
}

export interface DriverProfile {
  id: string;
  userId: string;
  licenseNumber: string;
  verificationStatus: DriverVerificationStatus;
  availabilityStatus: DriverAvailabilityStatus;
  currentLatitude: number | null;
  currentLongitude: number | null;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  vehicles?: Vehicle[];
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  driverId: string;
  plateNumber: string;
  model: string;
  type: VehicleType;
  year?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ride {
  id: string;
  passengerId: string;
  driverId?: string | null;
  vehicleId?: string | null;
  pickupLatitude: number;
  pickupLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  fare: number | null;
  currency: string;
  status: RideStatus;
  requestedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  passenger: {
    id: string;
    name: string;
    phone: string;
  };
  driver?: {
    id: string;
    userId: string;
    licenseNumber: string;
    verificationStatus: DriverVerificationStatus;
    availabilityStatus: DriverAvailabilityStatus;
    currentLatitude?: number | null;
    currentLongitude?: number | null;
    user: {
      id: string;
      name: string;
      phone: string;
    };
  } | null;
  vehicle?: Vehicle | null;
}

// API Envelope standard
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
}

// Auth Types
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// Admin Stats
export interface AdminDashboardStats {
  users: { total: number };
  drivers: { total: number };
  rides: {
    total: number;
    completed: number;
    active: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    currency: string;
  };
}

export interface PaginatedResult<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items?: T[];
}

export interface PaginatedRides extends PaginatedResult<Ride> {
  rides: Ride[];
}

export interface PaginatedUsers extends PaginatedResult<User> {
  users: User[];
}

export interface PaginatedDrivers extends PaginatedResult<DriverProfile> {
  drivers: DriverProfile[];
}
