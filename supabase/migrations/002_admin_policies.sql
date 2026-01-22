-- =====================================================
-- ADMIN RLS POLICIES
-- =====================================================
-- These policies allow admins to view and manage all professional profiles
-- Admin is determined by user_metadata.role = 'admin' or app_metadata.role = 'admin'

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFESSIONAL PROFILES - Admin Policies
-- =====================================================

-- Admins can view ALL professional profiles (regardless of status)
CREATE POLICY "Admins can view all profiles"
  ON professional_profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can update ALL professional profiles (for verification)
CREATE POLICY "Admins can update all profiles"
  ON professional_profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- SERVICES - Admin Policies
-- =====================================================

-- Admins can view all services
CREATE POLICY "Admins can view all services"
  ON services FOR SELECT
  TO authenticated
  USING (is_admin());

-- =====================================================
-- BOOKINGS - Admin Policies (optional, for admin oversight)
-- =====================================================

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (is_admin());

-- =====================================================
-- REVIEWS - Admin Policies
-- =====================================================

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can delete reviews (for moderation)
CREATE POLICY "Admins can delete reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- INSTRUCTIONS FOR SETTING UP ADMIN USER
-- =====================================================
-- To make a user an admin, run this SQL in the Supabase SQL Editor:
--
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'your-admin-email@example.com';
--
-- Or use the Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click on the user you want to make admin
-- 3. Edit their metadata to add: {"role": "admin"}
-- =====================================================
