# Storage Bucket Setup Guide

## Quick Setup (Recommended for Development)

### Option 1: Public Bucket (Easiest)

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Name: `game-builds`
4. **Toggle "Public bucket" to ON** ✅
5. Click **"Create bucket"**

That's it! Files can now be uploaded and accessed.

### Option 2: Private Bucket with RLS Policies

If you want more control, set up RLS policies:

1. Create the bucket (same as above, but keep it **Private**)
2. Go to **Storage** → **game-builds** → **Policies** tab
3. Click **"New Policy"** and create these policies:

#### Policy 1: Allow Uploads
- **Policy name**: `Allow authenticated uploads`
- **Allowed operation**: `INSERT`
- **Policy definition**:
  ```sql
  (bucket_id = 'game-builds'::text) AND (auth.role() = 'authenticated'::text)
  ```

#### Policy 2: Allow Reads
- **Policy name**: `Allow authenticated reads`
- **Allowed operation**: `SELECT`
- **Policy definition**:
  ```sql
  (bucket_id = 'game-builds'::text) AND (auth.role() = 'authenticated'::text)
  ```

#### Policy 3: Allow Updates/Deletes
- **Policy name**: `Allow authenticated updates`
- **Allowed operation**: `UPDATE`, `DELETE`
- **Policy definition**:
  ```sql
  (bucket_id = 'game-builds'::text) AND (auth.role() = 'authenticated'::text)
  ```

## Verify Setup

After creating the bucket, you can verify it exists:

```sql
SELECT * FROM storage.buckets WHERE name = 'game-builds';
```

## Troubleshooting

### "Bucket not found" error
- Make sure the bucket name is exactly `game-builds` (case-sensitive)
- Check that the bucket exists in Storage dashboard

### "Permission denied" error
- If bucket is private, make sure RLS policies are set up
- Or make the bucket public for easier access

### File upload fails
- Check browser console for specific error messages
- Verify you're authenticated (signed in)
- Make sure the bucket is either public or has proper RLS policies

