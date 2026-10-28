export type UserRole = 'user' | 'owner' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string | null;
  institution: string | null;
  avatar: string | null;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  status: 'verified' | 'pending' | 'rejected';
  certificate_ref: string | null;
  verified_at: string | null;
  verified_by: string | null;
  skill_name?: string;
  skill_category?: string;
}

export type ResourceCategory = 'equipment' | 'space' | 'digital';
export type ResourceStatus = 'available' | 'reserved' | 'in_use' | 'maintenance' | 'restricted';
export type ConditionRating = 'pristine' | 'good' | 'fair' | 'maintenance_required';

export interface Resource {
  id: string;
  title: string;
  slug: string;
  category: ResourceCategory;
  subcategory: string;
  description: string;
  specifications: Record<string, any>;
  location: string;
  building: string;
  room: string;
  hourly_rate: number;
  deposit: number;
  turnaround_buffer_mins: number;
  owner_id: string;
  status: ResourceStatus;
  condition_rating: ConditionRating;
  serial_number: string;
  passport_id: string;
  image_url: string;
  created_at: string;
  owner_name?: string;
  owner_email?: string;
  required_skills?: Skill[];
}

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'returned'
  | 'delayed'
  | 'cancelled'
  | 'disputed';

export interface Booking {
  id: string;
  resource_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  scheduled_return_time: string;
  actual_return_time: string | null;
  status: BookingStatus;
  purpose: string;
  total_cost: number;
  delay_minutes: number;
  created_at: string;
  updated_at: string;
  resource_title?: string;
  resource_category?: ResourceCategory;
  resource_image?: string;
  resource_passport_id?: string;
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
  owner_id?: string;
}

export interface WaitlistEntry {
  id: string;
  resource_id: string;
  user_id: string;
  requested_start: string;
  requested_end: string;
  priority_score: number;
  queue_position: number;
  status: 'waiting' | 'offered' | 'fulfilled' | 'cancelled';
  notes: string | null;
  created_at: string;
  user_name?: string;
  user_department?: string;
  resource_title?: string;
}

export interface ConditionReport {
  id: string;
  booking_id: string;
  resource_id: string;
  report_type: 'checkout' | 'return';
  condition_rating: string;
  checklist: Record<string, any>;
  discrepancies: string | null;
  photo_url: string | null;
  reported_by: string;
  timestamp: string;
  reporter_name?: string;
}

export interface MaintenanceRecord {
  id: string;
  resource_id: string;
  technician_id: string;
  maintenance_type: string;
  description: string;
  parts_replaced: string | null;
  cost: number;
  timestamp: string;
  status: string;
}

export interface DisruptionEvent {
  id: string;
  delayed_booking_id: string;
  affected_booking_id: string | null;
  buffer_minutes: number;
  delay_duration_minutes: number;
  risk_level: 'critical' | 'moderate' | 'nominal';
  suggested_alternative_resource_id: string | null;
  resolution_action: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  notes: string | null;
  created_at: string;
  delayed_resource_title?: string;
  affected_user_name?: string;
  suggested_alternative_title?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  link: string | null;
  read_status: number;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string;
  payload: Record<string, any> | null;
  created_at: string;
  actor_name?: string;
}

