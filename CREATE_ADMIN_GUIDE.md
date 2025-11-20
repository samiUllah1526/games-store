# How to Create Admins and Moderators

## 🎯 Overview

There are **two ways** to assign roles to users:
1. **Manual SQL Method** (Recommended for initial setup)
2. **Admin UI Method** (After first admin is created)

## 📋 Method 1: Manual SQL (Initial Setup)

### Step 1: Find User Email or ID

**Option A: By Email**
```sql
SELECT id, email, created_at
FROM auth.users
WHERE email = 'user@example.com';
```

**Option B: List All Users**
```sql
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;
```

### Step 2: Assign Admin Role

**By Email (Recommended):**
```sql
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

  -- Assign role
  IF target_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (target_user_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    RAISE NOTICE 'Admin role assigned successfully!';
  ELSE
    RAISE EXCEPTION 'User or admin role not found.';
  END IF;
END $$;
```

**By User ID (Direct):**
```sql
INSERT INTO user_roles (user_id, role_id)
SELECT 
  'USER_ID_HERE'::UUID,
  id
FROM roles
WHERE name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;
```

### Step 3: Assign Moderator Role

Same as above, but change `'admin'` to `'moderator'`:

```sql
DO $$
DECLARE
  target_user_id UUID;
  moderator_role_id UUID;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'user@example.com';

  SELECT id INTO moderator_role_id
  FROM roles
  WHERE name = 'moderator';

  IF target_user_id IS NOT NULL AND moderator_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (target_user_id, moderator_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    RAISE NOTICE 'Moderator role assigned successfully!';
  END IF;
END $$;
```

## 🖥️ Method 2: Admin UI (After First Admin)

Once you have at least one admin, you can use the Admin Dashboard:

1. Sign in as admin
2. Go to `/admin`
3. Click on **"User Roles"** tab
4. Search for user by email
5. Click **"Assign Role"** button
6. Select role and submit

**Note:** This requires Supabase Admin API to be enabled. If it's disabled, use Method 1.

## ✅ Verify Role Assignment

```sql
-- Check user's roles
SELECT 
  u.email,
  r.name as role_name,
  r.description
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'user@example.com';
```

## 🔍 List All Admins/Moderators

**List all admins:**
```sql
SELECT 
  u.email,
  u.created_at
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'admin'
ORDER BY u.created_at DESC;
```

**List all moderators:**
```sql
SELECT 
  u.email,
  u.created_at
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'moderator'
ORDER BY u.created_at DESC;
```

## 🗑️ Remove Role from User

```sql
DELETE FROM user_roles
WHERE user_id = 'USER_ID_HERE'::UUID
  AND role_id = (SELECT id FROM roles WHERE name = 'admin');
```

## 📝 Quick Reference

| Action | SQL Command |
|--------|-------------|
| Find user | `SELECT id, email FROM auth.users WHERE email = 'email@example.com';` |
| Assign admin | Use Method 1 above with `'admin'` |
| Assign moderator | Use Method 1 above with `'moderator'` |
| Check roles | `SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = 'USER_ID';` |
| Remove role | `DELETE FROM user_roles WHERE user_id = 'USER_ID' AND role_id = (SELECT id FROM roles WHERE name = 'admin');` |

## 🚨 Important Notes

1. **First Admin**: Must be created via SQL (Method 1)
2. **Session Refresh**: User must sign out and sign back in after role assignment
3. **RLS Policies**: Ensure RLS policies allow role assignment (included in RBAC_SCHEMA.sql)
4. **Admin API**: UI method requires Supabase Admin API (Settings > API > Enable Admin API)

## 🔄 Workflow

1. **Initial Setup**: Use SQL to create first admin
2. **Subsequent Admins**: Can be created via SQL or Admin UI
3. **Moderators**: Same process, just use 'moderator' role name
4. **Verification**: Always verify role assignment before testing

