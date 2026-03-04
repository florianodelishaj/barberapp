-- =============================================
-- BarberX — Supabase Schema
-- =============================================

-- Profili utente (estende auth.users)
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  phone        TEXT,
  birth_date   DATE,
  avatar_url   TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Trigger: crea profilo automaticamente dopo signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, status)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''), 'pending');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Barbieri
CREATE TABLE barbers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  avatar_url   TEXT,
  bio          TEXT,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Servizi
CREATE TABLE services (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  duration_minutes INT NOT NULL,
  price            DECIMAL(8,2) NOT NULL,
  icon_name        TEXT,
  is_active        BOOLEAN DEFAULT true,
  display_order    INT DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Disponibilità settimanale ricorrente
CREATE TABLE barber_schedules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id    UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  day_of_week  INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dom
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  is_active    BOOLEAN DEFAULT true,
  UNIQUE (barber_id, day_of_week)
);

-- Eccezioni per singoli giorni (day off o orari custom)
CREATE TABLE barber_exceptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id     UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  is_off        BOOLEAN DEFAULT false,
  custom_start  TIME,
  custom_end    TIME,
  UNIQUE (barber_id, date)
);

-- Appuntamenti
CREATE TABLE appointments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  barber_id            UUID NOT NULL REFERENCES barbers(id),
  service_id           UUID NOT NULL REFERENCES services(id),
  scheduled_at         TIMESTAMPTZ NOT NULL,
  duration_minutes     INT NOT NULL,
  price                DECIMAL(8,2) NOT NULL,
  status               TEXT NOT NULL DEFAULT 'confirmed'
                         CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  cancelled_at         TIMESTAMPTZ,
  cancellation_reason  TEXT,
  created_at           TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- profiles: utente vede/modifica solo il proprio
CREATE POLICY "own profile read" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- barbers: lettura pubblica (utenti autenticati)
CREATE POLICY "barbers read" ON barbers
  FOR SELECT USING (auth.role() = 'authenticated');

-- services: lettura pubblica (utenti autenticati)
CREATE POLICY "services read" ON services
  FOR SELECT USING (auth.role() = 'authenticated');

-- barber_schedules: lettura pubblica
CREATE POLICY "schedules read" ON barber_schedules
  FOR SELECT USING (auth.role() = 'authenticated');

-- barber_exceptions: lettura pubblica
CREATE POLICY "exceptions read" ON barber_exceptions
  FOR SELECT USING (auth.role() = 'authenticated');

-- appointments: utente vede/crea/cancella solo i propri
CREATE POLICY "own appointments read" ON appointments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own appointments insert" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own appointments update" ON appointments
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- Dati di esempio
-- =============================================

INSERT INTO barbers (name) VALUES
  ('Marco Bellini'),
  ('Luca Romano'),
  ('Giuseppe Russo'),
  ('Antonio Greco');

INSERT INTO services (name, duration_minutes, price, display_order) VALUES
  ('Taglio', 30, 25.00, 1),
  ('Taglio + Barba', 60, 45.00, 2),
  ('Barba', 25, 20.00, 3),
  ('Rasatura Tradizionale', 35, 30.00, 4),
  ('Styling & Finish', 20, 15.00, 5),
  ('Colorazione', 75, 55.00, 6),
  ('Trattamento Capelli', 40, 35.00, 7),
  ('Rifinitura Barba', 15, 12.00, 8),
  ('Taglio Bambino', 25, 18.00, 9);

-- Orari settimanali per ogni barbiere (Lun-Sab, 9:00-18:00)
INSERT INTO barber_schedules (barber_id, day_of_week, start_time, end_time)
SELECT b.id, d.day, '09:00', '18:00'
FROM barbers b
CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6)) AS d(day);
