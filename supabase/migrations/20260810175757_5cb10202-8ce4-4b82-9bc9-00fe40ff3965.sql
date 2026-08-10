
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ENUMS
CREATE TYPE public.app_role AS ENUM ('ev_user','station_owner','admin');
CREATE TYPE public.station_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.charger_type AS ENUM ('dc_fast','ac');
CREATE TYPE public.charger_status AS ENUM ('available','in_use','disabled','maintenance');
CREATE TYPE public.booking_status AS ENUM ('confirmed','active','completed','cancelled');
CREATE TYPE public.session_status AS ENUM ('active','completed');
CREATE TYPE public.payment_status AS ENUM ('pending','paid','failed');
CREATE TYPE public.complaint_status AS ENUM ('open','in_review','resolved');

-- UPDATED_AT HELPER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  preferred_charger_type public.charger_type,
  target_battery_level INT NOT NULL DEFAULT 80 CHECK (target_battery_level BETWEEN 20 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "self assign non admin role" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND role <> 'admin');

CREATE POLICY "read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- VEHICLES
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  registration_no TEXT,
  battery_capacity_kwh NUMERIC(6,2) NOT NULL DEFAULT 40,
  current_battery_level INT NOT NULL DEFAULT 50 CHECK (current_battery_level BETWEEN 0 AND 100),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_vehicles_user ON public.vehicles(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own vehicles" ON public.vehicles FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER trg_vehicles_updated BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- STATIONS
CREATE TABLE public.stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Hyderabad',
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL,
  opening_time TIME NOT NULL DEFAULT '06:00',
  closing_time TIME NOT NULL DEFAULT '23:00',
  is_24x7 BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5 CHECK (rating BETWEEN 0 AND 5),
  review_count INT NOT NULL DEFAULT 0,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  status public.station_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_stations_owner ON public.stations(owner_id);
CREATE INDEX idx_stations_status ON public.stations(status);
GRANT SELECT ON public.stations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stations TO authenticated;
GRANT ALL ON public.stations TO service_role;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read approved stations" ON public.stations FOR SELECT TO anon, authenticated
  USING (status = 'approved');
CREATE POLICY "owner reads own stations" ON public.stations FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "owner creates stations" ON public.stations FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND (public.has_role(auth.uid(),'station_owner') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "owner updates stations" ON public.stations FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "owner deletes stations" ON public.stations FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_stations_updated BEFORE UPDATE ON public.stations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.owns_station(_station_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.stations WHERE id = _station_id AND owner_id = _user_id);
$$;

-- CHARGERS
CREATE TABLE public.chargers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  charger_type public.charger_type NOT NULL DEFAULT 'ac',
  power_kw NUMERIC(6,2) NOT NULL DEFAULT 22,
  price_per_kwh NUMERIC(6,2) NOT NULL DEFAULT 10,
  status public.charger_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (station_id, label)
);
CREATE INDEX idx_chargers_station ON public.chargers(station_id);
GRANT SELECT ON public.chargers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chargers TO authenticated;
GRANT ALL ON public.chargers TO service_role;
ALTER TABLE public.chargers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read chargers" ON public.chargers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "owner manages chargers" ON public.chargers FOR ALL TO authenticated
  USING (public.owns_station(station_id, auth.uid()) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.owns_station(station_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_chargers_updated BEFORE UPDATE ON public.chargers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BOOKINGS
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  charger_id UUID NOT NULL REFERENCES public.chargers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  estimated_energy_kwh NUMERIC(8,2) NOT NULL DEFAULT 0,
  estimated_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.booking_status NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_time > start_time),
  CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (
    charger_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status IN ('confirmed','active'))
);
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_charger ON public.bookings(charger_id);
CREATE INDEX idx_bookings_station ON public.bookings(station_id);
CREATE INDEX idx_bookings_start ON public.bookings(start_time);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bookings read" ON public.bookings FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.owns_station(station_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own bookings insert" ON public.bookings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own bookings update" ON public.bookings FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.owns_station(station_id, auth.uid()) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.owns_station(station_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CHARGING SESSIONS
CREATE TABLE public.charging_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  charger_id UUID NOT NULL REFERENCES public.chargers(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  start_battery INT NOT NULL DEFAULT 20,
  current_battery INT NOT NULL DEFAULT 20,
  energy_kwh NUMERIC(8,2) NOT NULL DEFAULT 0,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.session_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_user ON public.charging_sessions(user_id);
CREATE INDEX idx_sessions_station ON public.charging_sessions(station_id);
GRANT SELECT, INSERT, UPDATE ON public.charging_sessions TO authenticated;
GRANT ALL ON public.charging_sessions TO service_role;
ALTER TABLE public.charging_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions read" ON public.charging_sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.owns_station(station_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "sessions insert" ON public.charging_sessions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "sessions update" ON public.charging_sessions FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER trg_sessions_updated BEFORE UPDATE ON public.charging_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PAYMENTS
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES public.charging_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  energy_kwh NUMERIC(8,2) NOT NULL DEFAULT 0,
  rate_per_kwh NUMERIC(6,2) NOT NULL DEFAULT 0,
  service_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  method TEXT NOT NULL DEFAULT 'simulated',
  status public.payment_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_station ON public.payments(station_id);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments read" ON public.payments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.owns_station(station_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "payments insert" ON public.payments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "payments update" ON public.payments FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- REVIEWS
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (station_id, user_id)
);
CREATE INDEX idx_reviews_station ON public.reviews(station_id);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "own reviews write" ON public.reviews FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- COMPLAINTS
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id UUID REFERENCES public.stations(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status public.complaint_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_complaints_user ON public.complaints(user_id);
GRANT SELECT, INSERT, UPDATE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complaints read" ON public.complaints FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "complaints insert" ON public.complaints FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "complaints update" ON public.complaints FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_complaints_updated BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SAVED STATIONS
CREATE TABLE public.saved_stations (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, station_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_stations TO authenticated;
GRANT ALL ON public.saved_stations TO service_role;
ALTER TABLE public.saved_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved stations" ON public.saved_stations FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- SEED: HYDERABAD STATIONS
INSERT INTO public.stations (id, name, address, city, latitude, longitude, opening_time, closing_time, is_24x7, rating, review_count, amenities, status) VALUES
('11111111-1111-4111-8111-111111111101','EcoCharge Gachibowli','Plot 42, DLF Cyber City Road, Gachibowli','Hyderabad',17.440810,78.348915,'00:00','23:59',true,4.8,214,ARRAY['Cafe','Restrooms','WiFi','Parking','Lounge'],'approved'),
('11111111-1111-4111-8111-111111111102','GreenVolt Hitech City','Survey 64, Madhapur Main Road, Hitech City','Hyderabad',17.447540,78.379300,'06:00','23:00',false,4.6,178,ARRAY['Cafe','Restrooms','Convenience Store','Parking'],'approved'),
('11111111-1111-4111-8111-111111111103','ChargeHub Madhapur','Road No 36, Jubilee Enclave, Madhapur','Hyderabad',17.453200,78.391000,'05:30','23:30',false,4.4,132,ARRAY['Restrooms','WiFi','Parking'],'approved'),
('11111111-1111-4111-8111-111111111104','EV Power Banjara Hills','Road No 12, Banjara Hills','Hyderabad',17.412600,78.436900,'00:00','23:59',true,4.7,256,ARRAY['Cafe','Restrooms','WiFi','Valet Parking','Lounge'],'approved'),
('11111111-1111-4111-8111-111111111105','RapidCharge Secunderabad','SD Road, Near Clock Tower, Secunderabad','Hyderabad',17.439900,78.498400,'06:00','22:00',false,4.2,96,ARRAY['Restrooms','Parking','Air Pump'],'approved');

INSERT INTO public.chargers (station_id, label, charger_type, power_kw, price_per_kwh, status) VALUES
('11111111-1111-4111-8111-111111111101','Charger #01','dc_fast',60,15,'available'),
('11111111-1111-4111-8111-111111111101','Charger #02','dc_fast',60,15,'available'),
('11111111-1111-4111-8111-111111111101','Charger #03','dc_fast',50,14,'in_use'),
('11111111-1111-4111-8111-111111111101','Charger #04','ac',22,10,'available'),
('11111111-1111-4111-8111-111111111101','Charger #05','ac',22,10,'available'),
('11111111-1111-4111-8111-111111111101','Charger #06','ac',11,9,'maintenance'),
('11111111-1111-4111-8111-111111111102','Charger #01','dc_fast',60,16,'available'),
('11111111-1111-4111-8111-111111111102','Charger #02','dc_fast',60,16,'in_use'),
('11111111-1111-4111-8111-111111111102','Charger #03','ac',22,10,'available'),
('11111111-1111-4111-8111-111111111102','Charger #04','ac',22,10,'available'),
('11111111-1111-4111-8111-111111111103','Charger #01','dc_fast',50,14,'available'),
('11111111-1111-4111-8111-111111111103','Charger #02','ac',22,9.5,'available'),
('11111111-1111-4111-8111-111111111103','Charger #03','ac',11,9,'disabled'),
('11111111-1111-4111-8111-111111111104','Charger #01','dc_fast',120,18,'available'),
('11111111-1111-4111-8111-111111111104','Charger #02','dc_fast',60,15,'available'),
('11111111-1111-4111-8111-111111111104','Charger #03','dc_fast',60,15,'in_use'),
('11111111-1111-4111-8111-111111111104','Charger #04','ac',22,10,'available'),
('11111111-1111-4111-8111-111111111104','Charger #05','ac',22,10,'available'),
('11111111-1111-4111-8111-111111111105','Charger #01','dc_fast',50,14,'available'),
('11111111-1111-4111-8111-111111111105','Charger #02','ac',22,10,'available'),
('11111111-1111-4111-8111-111111111105','Charger #03','ac',11,8.5,'available');
