export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'OWNER' | 'MANAGER' | 'USER';
  created_at: string;
}

export interface OwnerProfile {
  id: string;
  user_id: string;
  company_name: string | null;
  gst_number: string | null;
  kyc_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  created_at: string;
  user: User;
  personal_info?: {
    dob?: string;
    gender?: string;
    emergency_contact?: string;
    alt_mobile?: string;
    business_email?: string;
  };
  business_info?: {
    business_name: string;
    pg_name: string;
    business_type: 'BOYS_PG' | 'GIRLS_PG' | 'HOSTEL' | 'CO_LIVING';
  };
  address?: {
    country: string;
    state: string;
    city: string;
    area: string;
    address: string;
    pincode: string;
  };
  documents?: {
    id_type: string;
    id_url: string;
    business_doc_url?: string;
    property_proof_url: string;
    profile_photo_url: string;
    rejection_reason?: string;
  };
}

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address_line1: string;
  address_line2: string | null;
  landmark: string | null;
  area_id: string;
  city_id: string;
  state_id: string;
  country_id: string;
  zip_code: string;
  latitude: number | null;
  longitude: number | null;
  kyc_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  created_at: string;
  amenities?: string[];
  house_rules?: string[];
  check_in_time?: string;
  check_out_time?: string;
  food_available?: boolean;
  parking_available?: boolean;
  wifi_available?: boolean;
  laundry_available?: boolean;
  cctv_available?: boolean;
  manager_remarks?: string;
  admin_remarks?: string;
  property_images?: { id: string; image_url: string }[];
  images?: { id: string; url: string }[];
  floors?: Floor[];
}

export interface Floor {
  id: string;
  property_id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  rooms?: Room[];
  _count?: {
    rooms: number;
    beds: number;
  };
}

export interface Room {
  id: string;
  floor_id: string;
  room_number: string;
  sharing_capacity: number;
  room_type: 'AC' | 'NON_AC';
  price: number;
  security_deposit: number;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
  beds?: Bed[];
}

export interface Bed {
  id: string;
  room_id: string;
  bed_number: string;
  status: 'VACANT' | 'OCCUPIED' | 'UNDER_MAINTENANCE' | 'RESERVED';
  tenant_id: string | null;
  tenant?: Tenant;
  booking_history?: Booking[];
  rent?: number;
  security_deposit?: number;
}

export interface Tenant {
  id: string;
  user_id: string;
  user: User;
  status: 'ACTIVE' | 'VACATED';
  move_in_date: string;
  move_out_date: string | null;
  complaint_count?: number;
}

export interface Booking {
  id: string;
  tenant_id: string;
  bed_id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'MOVE_IN' | 'MOVE_OUT';
  move_in_date: string;
  move_out_date: string | null;
  rent_amount: number;
  security_deposit: number;
  created_at: string;
  remarks?: string;
  tenant?: {
    user: User;
  };
  bed?: {
    id: string;
    bed_number: string;
    room: {
      id: string;
      room_number: string;
      property: {
        id: string;
        name: string;
      };
    };
  };
}

export interface Complaint {
  id: string;
  tenant_id: string;
  property_id: string;
  room_id: string | null;
  title: string;
  description: string;
  category: 'MAINTENANCE' | 'CLEANING' | 'SECURITY' | 'NOISE' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  created_at: string;
  tenant?: {
    user: User;
  };
  property?: Property;
  assigned_staff?: string;
  resolution_notes?: string;
  resolution_images?: string[];
  replies?: { id: string; sender_role: string; message: string; timestamp: string }[];
}

export interface OwnerDashboardStats {
  totals: {
    properties: number;
    floors: number;
    rooms: number;
    beds: number;
    occupiedBeds: number;
    vacantBeds: number;
    reservedBeds: number;
    pendingVerificationProperties: number;
    verifiedProperties: number;
    pendingBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    activeTenants: number;
    vacatedTenants: number;
    openComplaints: number;
    resolvedComplaints: number;
  };
  charts: {
    occupancyTrend: { date: string; rate: number }[];
    bookingTrend: { date: string; bookings: number }[];
    complaintTrend: { date: string; count: number }[];
  };
  recentActivities: {
    id: string;
    type: 'BOOKING_REQUEST' | 'COMPLAINT_FILED' | 'NOTIFICATION_SENT' | 'PROPERTY_UPDATE';
    title: string;
    description: string;
    timestamp: string;
  }[];
}

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}
