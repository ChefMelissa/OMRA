export type UserRole = 'agency' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  created_at: string;
}

export type AgencyStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Agency {
  id: string;
  name: string;
  license_number: string;
  logo_url: string | null;
  description: string | null;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  status: AgencyStatus;
  rejection_reason: string | null;
  commission_rate: number;
  contract_signed: boolean;
  ccp_number: string | null;
  ccp_holder: string | null;
  branches: string | null;
  created_at: string;
  updated_at: string;
}

export type ProgramStatus = 'draft' | 'active' | 'closed';

export interface UmrahProgram {
  id: string;
  agency_id: string;
  title: string;
  description: string | null;
  duration_days: number;
  departure_date: string;
  return_date: string;
  departure_city: string;
  airline: string;
  seats_available: number;
  status: ProgramStatus;
  adult_commission: number;
  child_commission: number;
  flight_type: 'direct' | 'transit';
  child_price: number;
  created_at: string;
  updated_at: string;
  
  // Relations (optional/joined)
  agency?: Agency;
  hotels?: Hotel[];
  room_prices?: RoomPrice[];
  inclusions?: string[];
}

export type HolyCity = 'مكة' | 'المدينة';

export interface Hotel {
  id: string;
  program_id: string;
  city: HolyCity;
  hotel_name: string;
  stars: number;
  distance_meters: number;
  nights: number;
  board_basis: string | null;
  created_at: string;
}

export type RoomType = 'ثنائية' | 'ثلاثية' | 'رباعية' | 'خماسية';

export interface RoomPrice {
  id: string;
  program_id: string;
  room_type: RoomType;
  price: number; // in DZD
  created_at: string;
}

export interface ProgramInclusion {
  id: string;
  program_id: string;
  inclusion: string;
}

export type BookingStatus = 'new' | 'contacted' | 'booked' | 'cancelled';
export type AdminApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface BookingRequest {
  id: string;
  reference_number: string;
  program_id: string | null;
  agency_id: string;
  customer_name: string;
  customer_phone: string;
  is_whatsapp: boolean;
  room_type: RoomType;
  notes: string | null;
  status: BookingStatus;
  adults_count: number;
  children_count: number;
  booking_value: number | null; // in DZD
  commission_value: number | null; // in DZD
  admin_approval: AdminApprovalStatus;
  created_at: string;
  updated_at: string;
  
  // Relations
  program?: UmrahProgram;
  agency?: Agency;
}

export type SettlementStatus = 'unpaid' | 'paid';

export interface CommissionSettlement {
  id: string;
  agency_id: string;
  period_start: string;
  period_end: string;
  bookings_count: number;
  total_bookings_value: number;
  total_commission: number;
  status: SettlementStatus;
  created_at: string;
  updated_at: string;
  
  // Relations
  agency?: Agency;
}

export interface Inquiry {
  id: string;
  program_id: string;
  type: 'view' | 'whatsapp_click' | 'call_click';
  created_at: string;
}

export interface EditRequest {
  id: string;
  program_id: string;
  admin_notes: string;
  status: 'pending' | 'resolved';
  created_at: string;
}
