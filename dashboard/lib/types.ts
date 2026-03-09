export type UserStatus = "pending" | "approved" | "rejected";
export type AppointmentStatus = "confirmed" | "cancelled" | "completed";
export type UserRole = "barber" | "owner";

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  status: UserStatus;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffRole {
  user_id: string;
  role: UserRole;
  barber_id: string | null;
  created_at: string;
}

export interface Barber {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  display_order: number;
  color: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  icon_name: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface BarberSchedule {
  id: string;
  barber_id: string;
  day_of_week: number; // 0=Sunday … 6=Saturday
  start_time: string;  // "09:00:00"
  end_time: string;
  is_active: boolean;
}

export interface BarberException {
  id: string;
  barber_id: string;
  date: string; // "2026-03-15"
  is_off: boolean;
  custom_start: string | null;
  custom_end: string | null;
}

export interface Appointment {
  id: string;
  user_id: string | null;       // null = blocco manuale
  barber_id: string;
  service_id: string | null;    // null = blocco senza servizio
  scheduled_at: string;
  duration_minutes: number;
  price: number;
  status: AppointmentStatus;
  note: string | null;          // descrizione blocco manuale
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  created_at: string;
  // Joined relations
  barber?: Pick<Barber, "id" | "name" | "avatar_url">;
  service?: Pick<Service, "id" | "name" | "duration_minutes" | "price">;
  client?: Pick<Profile, "id" | "first_name" | "last_name" | "phone" | "email"> | null;
}

// Auth context shape
export interface AuthUser {
  profile: Profile;
  staffRole: StaffRole;
}
