-- Role-Based Access Control (RBAC) Schema
-- Run this in Supabase SQL Editor after the main schema

-- ============================================
-- Roles Table
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Permissions Table
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(100) NOT NULL, -- e.g., 'games', 'users', 'analytics'
  action VARCHAR(50) NOT NULL, -- e.g., 'approve', 'reject', 'delete', 'view_all'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Role Permissions (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- ============================================
-- User Roles (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role_id)
);

-- ============================================
-- Game Reviews Table (for admin actions)
-- ============================================
CREATE TABLE IF NOT EXISTS game_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'requested_changes')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Update Games Table with Review Fields
-- ============================================
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_game_reviews_game_id ON game_reviews(game_id);
CREATE INDEX IF NOT EXISTS idx_game_reviews_reviewer_id ON game_reviews(reviewer_id);

-- ============================================
-- Insert Default Roles
-- ============================================
INSERT INTO roles (name, description) VALUES
  ('developer', 'Game developers who can upload and manage their own games'),
  ('admin', 'Administrators who can review, approve, and reject games'),
  ('moderator', 'Moderators who can review games but with limited permissions')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Insert Default Permissions
-- ============================================
INSERT INTO permissions (name, description, resource, action) VALUES
  -- Game permissions
  ('games.view_own', 'View own games', 'games', 'view_own'),
  ('games.create', 'Create new games', 'games', 'create'),
  ('games.update_own', 'Update own games', 'games', 'update_own'),
  ('games.delete_own', 'Delete own games', 'games', 'delete_own'),
  ('games.view_all', 'View all games (admin)', 'games', 'view_all'),
  ('games.approve', 'Approve games for publication', 'games', 'approve'),
  ('games.reject', 'Reject games', 'games', 'reject'),
  ('games.delete_any', 'Delete any game (admin)', 'games', 'delete_any'),
  -- User permissions
  ('users.view', 'View user information', 'users', 'view'),
  ('users.manage_roles', 'Manage user roles (admin)', 'users', 'manage_roles'),
  -- Analytics permissions
  ('analytics.view_own', 'View own analytics', 'analytics', 'view_own'),
  ('analytics.view_all', 'View all analytics (admin)', 'analytics', 'view_all')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Assign Permissions to Roles
-- ============================================
-- Developer role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'developer'
  AND p.name IN (
    'games.view_own',
    'games.create',
    'games.update_own',
    'games.delete_own',
    'analytics.view_own'
  )
ON CONFLICT DO NOTHING;

-- Admin role permissions (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Moderator role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'moderator'
  AND p.name IN (
    'games.view_all',
    'games.approve',
    'games.reject',
    'analytics.view_all'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_reviews ENABLE ROW LEVEL SECURITY;

-- Roles policies (everyone can view, only admins can modify)
DROP POLICY IF EXISTS "Anyone can view roles" ON roles;
CREATE POLICY "Anyone can view roles"
  ON roles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage roles" ON roles;
CREATE POLICY "Admins can manage roles"
  ON roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Permissions policies (everyone can view, only admins can modify)
DROP POLICY IF EXISTS "Anyone can view permissions" ON permissions;
CREATE POLICY "Anyone can view permissions"
  ON permissions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage permissions" ON permissions;
CREATE POLICY "Admins can manage permissions"
  ON permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- User roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
CREATE POLICY "Admins can manage user roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Game reviews policies
DROP POLICY IF EXISTS "Users can view reviews for their games" ON game_reviews;
CREATE POLICY "Users can view reviews for their games"
  ON game_reviews FOR SELECT
  USING (
    game_id IN (
      SELECT id FROM games WHERE developer_id IN (
        SELECT id FROM developers WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins and moderators can create reviews" ON game_reviews;
CREATE POLICY "Admins and moderators can create reviews"
  ON game_reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
        AND r.name IN ('admin', 'moderator')
    )
  );

DROP POLICY IF EXISTS "Admins and moderators can view all reviews" ON game_reviews;
CREATE POLICY "Admins and moderators can view all reviews"
  ON game_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
        AND r.name IN ('admin', 'moderator')
    )
  );

-- ============================================
-- Helper Functions
-- ============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION user_has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has a specific permission
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_uuid AND p.name = permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user roles
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid UUID)
RETURNS TABLE(role_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT r.name::TEXT
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Update Games RLS to allow admins to update status
-- ============================================
DROP POLICY IF EXISTS "Admins can update any game status" ON games;
CREATE POLICY "Admins can update any game status"
  ON games FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

