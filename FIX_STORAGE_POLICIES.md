# Fix Storage Upload RLS Error

## Problem
Even though your bucket is "public", you're getting: "new row violates row-level security policy"

## Solution
Supabase Storage requires policies for **uploads** even if the bucket is public for reads. Here's how to fix it:

### Step 1: Go to Storage Policies

1. Open **Supabase Dashboard**
2. Go to **Storage** (left sidebar)
3. Click on **game-builds** bucket
4. Click on **"Policies"** tab

### Step 2: Create Upload Policy

Click **"New Policy"** and fill in:

**Policy Name**: `Allow authenticated uploads`

**Allowed Operations**: 
- ✅ **INSERT** (check this one)
- ❌ SELECT (uncheck)
- ❌ UPDATE (uncheck)
- ❌ DELETE (uncheck)

**Policy Definition** (paste this):
```sql
(bucket_id = 'game-builds'::text) AND (auth.role() = 'authenticated'::text)
```

Click **"Review"** then **"Save policy"**

### Step 3: Create Read Policy (Optional but Recommended)

Click **"New Policy"** again:

**Policy Name**: `Allow authenticated reads`

**Allowed Operations**: 
- ✅ **SELECT** (check this one)
- ❌ Others (uncheck)

**Policy Definition**:
```sql
(bucket_id = 'game-builds'::text) AND (auth.role() = 'authenticated'::text)
```

Click **"Review"** then **"Save policy"**

### Step 4: Test Upload

Try uploading a file again. It should work now!

## Alternative: Make Bucket Fully Public (Less Secure)

If you want to allow uploads without authentication (not recommended for production):

1. Go to **Storage** → **game-builds**
2. Click the **settings/gear icon**
3. Make sure **"Public bucket"** is ON
4. But you'll still need the INSERT policy above

## Why This Happens

Supabase Storage has its own RLS system separate from database RLS. Even "public" buckets require policies for write operations (INSERT, UPDATE, DELETE) for security.

