-- ================================================================
-- ServeEasy — Supabase Schema
-- Run this entire file in the Supabase SQL Editor once.
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles (extends auth.users) ────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','provider','admin')),
  avatar_url  TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Providers ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS providers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  title             TEXT,
  category          TEXT NOT NULL,
  bio               TEXT,
  experience_years  INT DEFAULT 1,
  rating            NUMERIC(3,1) DEFAULT 0,
  total_reviews     INT DEFAULT 0,
  completed_jobs    INT DEFAULT 0,
  is_available      BOOLEAN DEFAULT FALSE,
  is_verified       BOOLEAN DEFAULT FALSE,
  subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic','pro','elite')),
  surge_pricing     BOOLEAN DEFAULT FALSE,
  location_lat      NUMERIC,
  location_lng      NUMERIC,
  location_address  TEXT,
  avatar_initials   TEXT,
  phone             TEXT,
  earnings_today    NUMERIC DEFAULT 0,
  earnings_week     NUMERIC DEFAULT 0,
  earnings_month    NUMERIC DEFAULT 0,
  weekly_earnings   JSONB DEFAULT '[0,0,0,0,0,0,0]',
  documents         JSONB DEFAULT '{"aadhaar":"pending","license":"pending","backgroundCheck":"pending"}',
  services          JSONB DEFAULT '[]',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Bookings ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_ref      TEXT UNIQUE NOT NULL,
  invoice_number   TEXT,
  customer_id      UUID REFERENCES auth.users(id),
  customer_name    TEXT,
  provider_id      UUID REFERENCES providers(id),
  provider_name    TEXT,
  provider_category TEXT,
  services         JSONB NOT NULL DEFAULT '[]',
  scheduled_date   DATE NOT NULL,
  scheduled_time   TEXT NOT NULL,
  address          TEXT NOT NULL,
  landmark         TEXT,
  notes            TEXT,
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','accepted','en_route','arrived','in_progress','completed','cancelled')),
  payment_status   TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','deposit_pending','deposit_paid','paid','refund_requested','refunded')),
  payment_type     TEXT DEFAULT 'full',
  payment_method   TEXT,
  subtotal         NUMERIC DEFAULT 0,
  surge_fee        NUMERIC DEFAULT 0,
  conv_fee         NUMERIC DEFAULT 0,
  gst              NUMERIC DEFAULT 0,
  total            NUMERIC DEFAULT 0,
  deposit_amount   NUMERIC DEFAULT 0,
  timeline         JSONB DEFAULT '[]',
  review           JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

-- ── Reviews ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id    UUID REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id   UUID REFERENCES auth.users(id),
  provider_id   UUID REFERENCES providers(id),
  customer_name TEXT,
  rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text          TEXT,
  tip           NUMERIC DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews    ENABLE ROW LEVEL SECURITY;

-- Profiles: own row only
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

-- Providers: public read, owner write
CREATE POLICY "providers_read"  ON providers FOR SELECT USING (TRUE);
CREATE POLICY "providers_write" ON providers FOR ALL  USING (auth.uid() = user_id);

-- Bookings: customer or provider of that booking
CREATE POLICY "bookings_access" ON bookings FOR ALL
  USING (
    auth.uid() = customer_id
    OR auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id)
  );

-- Reviews: public read, customer who made it can write
CREATE POLICY "reviews_read"  ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "reviews_write" ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- ── Seed Demo Providers ───────────────────────────────────────────
-- NOTE: After running this schema, sign up with demo provider emails
-- via the app UI; then update providers.user_id to match auth.users.id
-- Or use the "Insert rows" UI in Supabase Table Editor.

INSERT INTO providers (name, title, category, bio, experience_years, rating, total_reviews, completed_jobs, is_available, is_verified, subscription_plan, surge_pricing, location_address, avatar_initials, phone, earnings_today, earnings_week, earnings_month, weekly_earnings, documents, services)
VALUES
(
  'Rajesh Kumar', 'Master Electrician', 'Electrical',
  'Licensed electrician with 8+ years across residential and commercial projects.',
  8, 4.9, 342, 520, TRUE, TRUE, 'pro', FALSE,
  'Chowk, Lucknow', 'RK', '9812345678', 2450, 14200, 48200,
  '[1800,2100,950,2800,3200,2450,0]',
  '{"aadhaar":"verified","license":"verified","backgroundCheck":"pending"}',
  '[{"id":"s1","name":"Fan Installation","price":250,"duration":60},{"id":"s2","name":"Switch/Socket Repair","price":150,"duration":30},{"id":"s3","name":"Wiring Check","price":200,"duration":45},{"id":"s4","name":"MCB/Fuse Replacement","price":180,"duration":30},{"id":"s5","name":"New Connection","price":400,"duration":90}]'
),
(
  'Sunita Devi', 'Professional Cleaner', 'Cleaning',
  'Expert in deep home cleaning, kitchen sanitisation, and post-renovation cleanup.',
  5, 4.8, 210, 380, TRUE, TRUE, 'elite', TRUE,
  'Gomti Nagar, Lucknow', 'SD', '9823456789', 1800, 10500, 38000,
  '[2200,1800,1500,2100,1900,1800,0]',
  '{"aadhaar":"verified","license":"verified","backgroundCheck":"verified"}',
  '[{"id":"s6","name":"Basic Home Cleaning","price":400,"duration":120},{"id":"s7","name":"Deep Cleaning","price":800,"duration":240},{"id":"s8","name":"Kitchen Deep Clean","price":500,"duration":180},{"id":"s9","name":"Bathroom Sanitisation","price":300,"duration":90},{"id":"s10","name":"Post-Construction Clean","price":1200,"duration":360}]'
),
(
  'Mohan Lal', 'Licensed Plumber', 'Plumbing',
  'Seasoned plumber specialising in leak repairs, installations, and waterproofing.',
  10, 4.7, 189, 295, TRUE, TRUE, 'basic', FALSE,
  'Aliganj, Lucknow', 'ML', '9834567890', 1200, 8900, 32000,
  '[1200,1500,800,1900,2100,1200,0]',
  '{"aadhaar":"verified","license":"verified","backgroundCheck":"verified"}',
  '[{"id":"s11","name":"Pipe Leak Repair","price":300,"duration":60},{"id":"s12","name":"Tap Replacement","price":200,"duration":45},{"id":"s13","name":"Drain Unclogging","price":250,"duration":60},{"id":"s14","name":"Water Heater Install","price":500,"duration":120},{"id":"s15","name":"Toilet Repair","price":350,"duration":90}]'
),
(
  'Arjun Singh', 'AC Technician', 'AC Repair',
  'Certified HVAC technician for all brands of air conditioners.',
  7, 4.9, 278, 410, FALSE, TRUE, 'pro', TRUE,
  'Indira Nagar, Lucknow', 'AS', '9845678901', 3200, 18500, 62000,
  '[2800,3200,2100,3800,4200,3200,0]',
  '{"aadhaar":"verified","license":"verified","backgroundCheck":"verified"}',
  '[{"id":"s16","name":"AC Service & Clean","price":600,"duration":90},{"id":"s17","name":"Gas Refill (1 ton)","price":800,"duration":60},{"id":"s18","name":"PCB Repair","price":1200,"duration":120},{"id":"s19","name":"AC Installation","price":1500,"duration":180},{"id":"s20","name":"Drain Pipe Clean","price":300,"duration":30}]'
),
(
  'Priya Kapoor', 'Interior Painter', 'Painting',
  'Specialist in interior and exterior painting with premium finishes.',
  4, 4.6, 97, 145, TRUE, FALSE, 'basic', FALSE,
  'Rajajipuram, Lucknow', 'PK', '9856789012', 800, 5200, 18000,
  '[600,800,0,1200,1400,800,0]',
  '{"aadhaar":"verified","license":"pending","backgroundCheck":"pending"}',
  '[{"id":"s21","name":"1 Room Painting","price":800,"duration":240},{"id":"s22","name":"Full Home (1BHK)","price":4500,"duration":480},{"id":"s23","name":"Exterior Wall","price":2000,"duration":360},{"id":"s24","name":"Touch-up Painting","price":400,"duration":120},{"id":"s25","name":"Waterproofing","price":1500,"duration":300}]'
),
(
  'Deepak Yadav', 'Carpenter & Furniture Expert', 'Carpentry',
  'Custom furniture, door/window repair, and modular kitchen fitting.',
  6, 4.5, 134, 205, TRUE, TRUE, 'pro', FALSE,
  'Hazratganj, Lucknow', 'DY', '9867890123', 1600, 9800, 35000,
  '[1400,1600,1200,2000,1800,1600,0]',
  '{"aadhaar":"verified","license":"verified","backgroundCheck":"verified"}',
  '[{"id":"s26","name":"Door/Window Repair","price":350,"duration":90},{"id":"s27","name":"Furniture Assembly","price":400,"duration":120},{"id":"s28","name":"Wardrobe Fitting","price":800,"duration":180},{"id":"s29","name":"Custom Shelf","price":600,"duration":150},{"id":"s30","name":"Laminate Work","price":500,"duration":120}]'
);
