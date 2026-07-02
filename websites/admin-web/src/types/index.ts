export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'OWNER' | 'MANAGER' | 'USER';
  created_at: string;
  profile_image?: { url: string } | null;
}

export interface OwnerProfile {
  id: string;
  user_id: string;
  company_name: string | null;
  gst_number: string | null;
  kyc_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  created_at: string;
  user: User;
  owner_documents?: {
    id: string;
    type: string;
    url: string;
    status: string;
  }[];
  _count?: {
    properties: number;
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
  owner?: OwnerProfile;
  city?: { name: string };
  state?: { name: string };
  images?: { url: string }[];
  property_images?: { image_url: string }[];
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
  tenant?: {
    user: User;
  };
  bed?: {
    room: {
      room_number: string;
      property: {
        name: string;
      };
    };
  };
}

export interface Payment {
  id: string;
  tenant_id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  transaction_id: string | null;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  payment_date: string;
  created_at: string;
  tenant?: {
    user: User;
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
}
