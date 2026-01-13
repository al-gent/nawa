-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE location_type AS ENUM ('mobile', 'shop');

-- =====================================================
-- PROFESSIONAL PROFILES TABLE
-- =====================================================
CREATE TABLE professional_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  bio TEXT,
  service_type TEXT NOT NULL, -- e.g., 'braider', 'barber', 'tutor', 'plumber'

  -- Location data
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,

  -- Portfolio and verification
  portfolio_images TEXT[] DEFAULT '{}',
  verification_documents TEXT[] DEFAULT '{}',
  verification_status verification_status DEFAULT 'pending',
  verification_notes TEXT, -- Admin notes for rejection reasons

  -- Metadata
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for professional_profiles
CREATE POLICY "Public can view approved profiles"
  ON professional_profiles FOR SELECT
  USING (verification_status = 'approved' AND is_active = true);

CREATE POLICY "Users can view own profile"
  ON professional_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON professional_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON professional_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- SERVICES TABLE
-- =====================================================
CREATE TABLE services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  professional_id UUID REFERENCES professional_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL, -- Service duration in minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services
CREATE POLICY "Public can view active services from approved professionals"
  ON services FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE id = services.professional_id
      AND verification_status = 'approved'
      AND is_active = true
    )
  );

CREATE POLICY "Professionals can view own services"
  ON services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE id = services.professional_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own services"
  ON services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE id = services.professional_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own services"
  ON services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE id = services.professional_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE id = services.professional_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete own services"
  ON services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE id = services.professional_id
      AND user_id = auth.uid()
    )
  );

-- =====================================================
-- AVAILABILITY RULES TABLE (Recurring weekly schedule)
-- =====================================================
CREATE TABLE availability_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  professional_id UUID REFERENCES professional_profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Enable RLS
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for availability_rules
CREATE POLICY "Public can view active availability rules for approved professionals"
  ON availability_rules FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE id = availability_rules.professional_id
      AND verification_status = 'approved'
      AND is_active = true
    )
  );

CREATE POLICY "Professionals can manage own availability rules"
  ON availability_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE id = availability_rules.professional_id
      AND user_id = auth.uid()
    )
  );

-- =====================================================
-- AVAILABILITY OVERRIDES TABLE (One-time exceptions)
-- =====================================================
CREATE TABLE availability_overrides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  professional_id UUID REFERENCES professional_profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN NOT NULL, -- false = day off, true = special hours
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_override_time CHECK (
    (is_available = false) OR
    (is_available = true AND start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  )
);

-- Enable RLS
ALTER TABLE availability_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for availability_overrides
CREATE POLICY "Public can view availability overrides for approved professionals"
  ON availability_overrides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE id = availability_overrides.professional_id
      AND verification_status = 'approved'
      AND is_active = true
    )
  );

CREATE POLICY "Professionals can manage own availability overrides"
  ON availability_overrides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE id = availability_overrides.professional_id
      AND user_id = auth.uid()
    )
  );

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES professional_profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,

  -- Booking time (stored in UTC)
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Location
  location_type location_type NOT NULL,
  client_location TEXT, -- Address if mobile service
  client_lat DECIMAL(10, 8),
  client_lng DECIMAL(11, 8),

  -- Status and notes
  status booking_status DEFAULT 'pending',
  client_notes TEXT,
  professional_notes TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_booking_time CHECK (end_time > start_time)
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
CREATE POLICY "Clients can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Professionals can view their bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE id = bookings.professional_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own pending bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = client_id AND status = 'pending')
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Professionals can update their bookings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE id = bookings.professional_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE id = bookings.professional_id
      AND user_id = auth.uid()
    )
  );

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES professional_profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Public can view reviews for approved professionals"
  ON reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE id = reviews.professional_id
      AND verification_status = 'approved'
    )
  );

CREATE POLICY "Clients can create reviews for completed bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = reviews.booking_id
      AND client_id = auth.uid()
      AND status = 'completed'
    )
  );

CREATE POLICY "Clients can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Professional profiles
CREATE INDEX idx_professional_profiles_user_id ON professional_profiles(user_id);
CREATE INDEX idx_professional_profiles_verification_status ON professional_profiles(verification_status);
CREATE INDEX idx_professional_profiles_service_type ON professional_profiles(service_type);
CREATE INDEX idx_professional_profiles_location ON professional_profiles(lat, lng);

-- Services
CREATE INDEX idx_services_professional_id ON services(professional_id);
CREATE INDEX idx_services_is_active ON services(is_active);

-- Availability rules
CREATE INDEX idx_availability_rules_professional_id ON availability_rules(professional_id);
CREATE INDEX idx_availability_rules_day_of_week ON availability_rules(day_of_week);

-- Availability overrides
CREATE INDEX idx_availability_overrides_professional_id ON availability_overrides(professional_id);
CREATE INDEX idx_availability_overrides_date ON availability_overrides(date);

-- Bookings
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_professional_id ON bookings(professional_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Reviews
CREATE INDEX idx_reviews_professional_id ON reviews(professional_id);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_professional_profiles_updated_at
  BEFORE UPDATE ON professional_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_rules_updated_at
  BEFORE UPDATE ON availability_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_overrides_updated_at
  BEFORE UPDATE ON availability_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Calculate average rating for a professional
CREATE OR REPLACE FUNCTION get_professional_average_rating(prof_id UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE professional_id = prof_id;
$$ LANGUAGE SQL STABLE;

-- Count total reviews for a professional
CREATE OR REPLACE FUNCTION get_professional_review_count(prof_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM reviews WHERE professional_id = prof_id;
$$ LANGUAGE SQL STABLE;
