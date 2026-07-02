// Core domain types — inline (no cross-project dependency)
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
  _count?: { properties: number };
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
  tenant?: { user: User };
  bed?: { room: { room_number: string; property: { name: string } } };
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
  tenant?: { user: User };
  property?: Property;
}

export interface ManagerDashboardStats {
  totals: {
    pendingOwners: number;
    pendingProperties: number;
    pendingBookings: number;
    openComplaints: number;
    assignedTasks: number;
    waitingApprovalProperties: number;
    todayCompletedTasks: number;
    avgVerificationTimeHours: number;
  };
  charts: {
    ownerVerificationTrend: { date: string; pending: number; approved: number }[];
    propertyApprovalTrend: { date: string; pending: number; approved: number }[];
    complaintStatus: { status: string; count: number; color: string }[];
    taskCompletionRate: { date: string; rate: number }[];
  };
  recentActivities: {
    id: string;
    type: 'OWNER_REGISTRATION' | 'PROPERTY_SUBMISSION' | 'COMPLAINT_FILED' | 'BOOKING_REQUEST' | 'TASK_ASSIGNED';
    title: string;
    description: string;
    timestamp: string;
    status?: string;
  }[];
}

export interface ManagerTask {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLARIFICATION_REQUESTED';
  due_date: string;
  assigned_to: string;
  clarification_notes?: string;
}

export interface VerificationHistoryItem {
  id: string;
  actor_name: string;
  action: 'APPROVED' | 'REJECTED' | 'DOCUMENTS_REQUESTED' | 'SUSPENDED' | 'CORRECTIONS_REQUESTED';
  notes: string;
  timestamp: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ManagerProperty extends Property {
  property_images?: { image_url: string }[];
  amenities?: string[];
  rooms?: any[];
  images?: { url: string }[];
}
