export type UserStatus = 'pending' | 'approved' | 'rejected';
export type AppointmentStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  birth_date: string | null;
  avatar_url: string | null;
  status: UserStatus;
  created_at: string;
}

export interface Barber {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
}

export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  icon_name: string | null;
  is_active: boolean;
  display_order: number;
}

export interface Appointment {
  id: string;
  user_id: string;
  barber_id: string;
  service_id: string;
  scheduled_at: string;
  duration_minutes: number;
  price: number;
  status: AppointmentStatus;
  cancelled_at: string | null;
  created_at: string;
  barber?: Barber;
  service?: Service;
}

export interface TimeSlot {
  time: string; // "09:00"
  barber: Barber;
  available: boolean;
}

export interface BookingDraft {
  service: Service | null;
  date: string | null;     // ISO date "2026-03-11"
  slot: string | null;     // "09:00"
  barber: Barber | null;
}
