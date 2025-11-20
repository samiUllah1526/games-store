-- Manage User Roles - Admin and Moderator Assignment
-- Run these queries in Supabase SQL Editor

-- ============================================
-- Method 1: Assign Role by Email
-- ============================================
-- Replace 'user@example.com' with the actual email
-- Replace 'admin' with 'moderator' if assigning moderator role

DO $$
DECLARE
  target_user_id UUID;
  target_role_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'user@example.com';

  -- Get role ID
  SELECT id INTO target_role_id
  FROM roles
  WHERE name = 'admin'; -- Change to 'moderator' for moderator role

  -- Assign role
  IF target_user_id IS NOT NULL AND target_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, created_by)
    VALUES (target_user_id, target_role_id, target_user_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    RAISE NOTICE 'Role assigned successfully!';
  ELSE
    RAISE EXCEPTION 'User or role not found. Check email and role name.';
  END IF;
END $$;

-- ============================================
-- Method 2: Assign Role by User ID (Direct)
-- ============================================
-- Replace 'USER_ID_HERE' with the actual UUID from auth.users

INSERT INTO user_roles (user_id, role_id)
SELECT 
  'USER_ID_HERE'::UUID,
  id
FROM roles
WHERE name = 'admin' -- Change to 'moderator' for moderator role
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================
-- Method 3: List All Users and Their Roles
-- ============================================
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  COALESCE(
    string_agg(r.name, ', ' ORDER BY r.name),
    'No roles assigned'
  ) as roles
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.email, u.created_at
ORDER BY u.created_at DESC;

-- ============================================
-- Method 4: Find User ID by Email
-- ============================================
SELECT id, email, created_at
FROM auth.users
WHERE email = 'user@example.com';

-- ============================================
-- Method 5: Remove Role from User
-- ============================================
DELETE FROM user_roles
WHERE user_id = 'USER_ID_HERE'::UUID
  AND role_id = (SELECT id FROM roles WHERE name = 'admin');

-- ============================================
-- Method 6: Check User's Current Roles
-- ============================================
SELECT 
  u.email,
  r.name as role_name,
  r.description
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'user@example.com';

-- ============================================
-- Method 7: Assign Multiple Roles to User
-- ============================================
-- Assign both admin and moderator roles
INSERT INTO user_roles (user_id, role_id)
SELECT 
  'USER_ID_HERE'::UUID,
  id
FROM roles
WHERE name IN ('admin', 'moderator')
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================
-- Quick Commands Reference
-- ============================================
-- 1. Find user: SELECT id, email FROM auth.users WHERE email = 'email@example.com';
-- 2. Assign admin: Use Method 1 or 2 above
-- 3. Assign moderator: Same as admin, but change 'admin' to 'moderator'
-- 4. List all admins: SELECT u.email FROM auth.users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE r.name = 'admin';
-- 5. Remove role: Use Method 5 above

