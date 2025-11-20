# RLS Policy Troubleshooting

## Error: "new row violates row-level security policy"

This error occurs when Row Level Security (RLS) policies block an insert/update operation.

### Common Causes:

1. **User not authenticated** - RLS policies check `auth.uid()`, which requires an active session
2. **Session not properly set** - The Supabase client needs the JWT token
3. **RLS policy mismatch** - The policy condition doesn't match the data being inserted

### Solution Steps:

#### 1. Verify Authentication

Make sure the user is logged in:
- Check browser console for session info
- Verify `user` object exists in React context
- Ensure `supabase.auth.getSession()` returns a valid session

#### 2. Check RLS Policies

Run this in Supabase SQL Editor to verify policies exist:

```sql
SELECT * FROM pg_policies WHERE tablename = 'developers';
```

#### 3. Test RLS Policy Directly

Test if the policy works by running this in Supabase SQL Editor (replace with your user ID):

```sql
-- Check if auth.uid() works
SELECT auth.uid() as current_user_id;

-- Test the policy condition
SELECT * FROM developers WHERE user_id = auth.uid();
```

#### 4. Verify Session Token

The Supabase client automatically includes the JWT token in requests. To verify:

```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User ID:', session?.user?.id);
```

#### 5. Manual Policy Check

If policies seem correct but still failing, try recreating them:

```sql
-- Drop and recreate developer insert policy
DROP POLICY IF EXISTS "Users can insert their own developer profile" ON developers;

CREATE POLICY "Users can insert their own developer profile"
  ON developers FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Debugging in Code

Add this to your component to debug:

```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session exists:', !!session);
console.log('User ID from session:', session?.user?.id);
console.log('User ID from context:', user?.id);
console.log('Match:', session?.user?.id === user?.id);
```

### Quick Fix

If you're still having issues, you can temporarily disable RLS for testing (NOT recommended for production):

```sql
ALTER TABLE developers DISABLE ROW LEVEL SECURITY;
```

Then re-enable after testing:

```sql
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
```

### Most Common Issue

The most common cause is that the Supabase client doesn't have the session token. This usually happens if:
- User signed in but session expired
- Multiple Supabase client instances
- Session not properly initialized

Make sure you're using the same Supabase client instance that was used for authentication.

