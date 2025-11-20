-- Assign Admin Role to a User
-- Run this in Supabase SQL Editor
-- Replace 'YOUR_USER_EMAIL' with the email of the user you want to make admin

-- First, get the user ID from their email
-- Replace 'your-email@example.com' with the actual email
DO $$
DECLARE
  target_user_id UUID;
  admin_role_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'your-email@example.com';

  -- Get admin role ID
  SELECT id INTO admin_role_id
  FROM roles
  WHERE name = 'admin';

  -- Assign admin role to user
  IF target_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, created_by)
    VALUES (target_user_id, admin_role_id, target_user_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    RAISE NOTICE 'Admin role assigned successfully to user: %', target_user_id;
  ELSE
    RAISE EXCEPTION 'User or admin role not found. Check email and ensure roles table has admin role.';
  END IF;
END $$;

-- Alternative: Direct assignment if you know the user ID
-- Uncomment and replace 'USER_ID_HERE' with actual UUID
-- INSERT INTO user_roles (user_id, role_id)
-- SELECT 
--   'USER_ID_HERE'::UUID,
--   id
-- FROM roles
-- WHERE name = 'admin'
-- ON CONFLICT (user_id, role_id) DO NOTHING;

-- Verify the assignment
-- SELECT 
--   u.email,
--   r.name as role_name
-- FROM auth.users u
-- JOIN user_roles ur ON u.id = ur.user_id
-- JOIN roles r ON ur.role_id = r.id
-- WHERE r.name = 'admin';

