-- Fix Infinite Recursion in user_roles RLS Policies
-- Run this in Supabase SQL Editor

-- ============================================
-- Step 1: Create Security Definer Function to Check Admin
-- ============================================
-- This function bypasses RLS to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid AND r.name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Step 2: Drop Existing Problematic Policies
-- ============================================
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;

-- ============================================
-- Step 3: Create Fixed Policies
-- ============================================
-- Policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Admins can manage user roles (using security definer function)
CREATE POLICY "Admins can manage user roles"
  ON user_roles FOR ALL
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));

-- ============================================
-- Step 4: Fix Game Reviews Policies (Same Issue)
-- ============================================
DROP POLICY IF EXISTS "Admins and moderators can create reviews" ON game_reviews;
DROP POLICY IF EXISTS "Admins and moderators can view all reviews" ON game_reviews;

-- Create helper function for admin/moderator check
CREATE OR REPLACE FUNCTION is_user_admin_or_moderator(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid AND r.name IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate game reviews policies
CREATE POLICY "Admins and moderators can create reviews"
  ON game_reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid()
    AND is_user_admin_or_moderator(auth.uid())
  );

CREATE POLICY "Admins and moderators can view all reviews"
  ON game_reviews FOR SELECT
  USING (is_user_admin_or_moderator(auth.uid()));

-- ============================================
-- Step 5: Fix Games Update Policy
-- ============================================
DROP POLICY IF EXISTS "Admins can update any game status" ON games;

CREATE POLICY "Admins can update any game status"
  ON games FOR UPDATE
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));

-- ============================================
-- Step 6: Fix Roles and Permissions Policies
-- ============================================
DROP POLICY IF EXISTS "Admins can manage roles" ON roles;
DROP POLICY IF EXISTS "Admins can manage permissions" ON permissions;

CREATE POLICY "Admins can manage roles"
  ON roles FOR ALL
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));

CREATE POLICY "Admins can manage permissions"
  ON permissions FOR ALL
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));

-- ============================================
-- Verify Functions Created
-- ============================================
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('is_user_admin', 'is_user_admin_or_moderator');

