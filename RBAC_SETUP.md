# RBAC (Role-Based Access Control) Setup Guide

## 🎯 Overview

The system now has a scalable role-based access control system with:
- **Roles**: developer, admin, moderator (easily extensible)
- **Permissions**: Granular permissions for different actions
- **Admin Dashboard**: Interface for reviewing and approving games
- **Protected Routes**: Admin pages are only accessible to admins

## 📋 Setup Steps

### Step 1: Run RBAC Schema

1. Open **Supabase SQL Editor**
2. Copy and paste the contents of `RBAC_SCHEMA.sql`
3. Run the SQL script
4. This creates:
   - `roles` table
   - `permissions` table
   - `role_permissions` table (many-to-many)
   - `user_roles` table (many-to-many)
   - `game_reviews` table
   - Helper functions for role checking
   - RLS policies

### Step 2: Assign Admin Role to Your User

1. Open `ASSIGN_ADMIN_ROLE.sql`
2. Replace `'your-email@example.com'` with your actual email
3. Run it in Supabase SQL Editor
4. Or use the direct UUID method if you know your user ID

**Quick method - Get your user ID first:**
```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

Then assign admin role:
```sql
INSERT INTO user_roles (user_id, role_id)
SELECT 
  'YOUR_USER_ID_HERE'::UUID,
  id
FROM roles
WHERE name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;
```

### Step 3: Verify Admin Access

1. Sign out and sign back in (to refresh roles)
2. Check the sidebar - you should see "Admin Panel" menu item
3. Visit `/admin` - you should see the admin dashboard

## 🎮 Game Status Workflow

### Status Flow:
```
Developer uploads game
    ↓
Status: 'draft' (created)
    ↓
File uploads successfully
    ↓
Status: 'pending_review' (automatic)
    ↓
Admin reviews in /admin dashboard
    ↓
Admin approves → Status: 'live'
    OR
Admin rejects → Status: 'rejected' (with reason)
```

### Who Can Do What:

| Action | Developer | Admin | Moderator |
|--------|-----------|-------|-----------|
| Upload games | ✅ | ✅ | ✅ |
| View own games | ✅ | ✅ | ✅ |
| View all games | ❌ | ✅ | ✅ |
| Approve games | ❌ | ✅ | ✅ |
| Reject games | ❌ | ✅ | ✅ |
| Delete own games | ✅ | ✅ | ❌ |
| Delete any game | ❌ | ✅ | ❌ |

## 🛡️ Roles & Permissions

### Default Roles:

1. **Developer**
   - Can upload and manage own games
   - Can view own analytics
   - Cannot approve/reject games

2. **Admin**
   - All permissions
   - Can approve/reject games
   - Can manage user roles
   - Can view all games and analytics

3. **Moderator**
   - Can review and approve/reject games
   - Can view all games
   - Cannot manage user roles
   - Cannot delete games

### Adding New Roles:

1. Insert into `roles` table:
```sql
INSERT INTO roles (name, description) 
VALUES ('new_role', 'Description of new role');
```

2. Assign permissions:
```sql
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'new_role'),
  id
FROM permissions
WHERE name IN ('permission1', 'permission2');
```

3. Assign to users:
```sql
INSERT INTO user_roles (user_id, role_id)
SELECT 
  'user_id'::UUID,
  (SELECT id FROM roles WHERE name = 'new_role');
```

## 📁 Files Created

- `RBAC_SCHEMA.sql` - Database schema for roles and permissions
- `ASSIGN_ADMIN_ROLE.sql` - Script to assign admin role
- `src/lib/rbac.ts` - RBAC utility functions
- `src/hooks/useRBAC.ts` - React hook for role checking
- `src/components/AdminDashboard.tsx` - Admin review interface
- `src/components/AdminPage.tsx` - Admin page wrapper
- `src/pages/admin.astro` - Admin route

## 🔒 Security Features

1. **RLS Policies**: All tables protected with Row Level Security
2. **Route Protection**: Admin pages check role before rendering
3. **Component Protection**: Admin components show "Access Denied" for non-admins
4. **Permission Checks**: Functions verify permissions before actions

## 🧪 Testing

1. **Test as Developer**:
   - Upload a game
   - Should see status: "pending_review"
   - Cannot access `/admin`

2. **Test as Admin**:
   - Sign in with admin account
   - Should see "Admin Panel" in sidebar
   - Can access `/admin`
   - Can approve/reject games
   - Can add comments to reviews

3. **Test Approval Flow**:
   - Upload game as developer
   - Sign in as admin
   - Go to `/admin`
   - See game in "Pending Review" tab
   - Click "Approve" or "Reject"
   - Add optional comment
   - Submit review
   - Game status updates

## 🚀 Next Steps

- [ ] Assign admin role to your account
- [ ] Test the admin dashboard
- [ ] Review and approve/reject test games
- [ ] Add more roles/permissions as needed
- [ ] Customize admin dashboard UI

