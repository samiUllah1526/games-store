# Quick Setup Guide - Fix "Table not found" Error

## ⚡ Quick Fix

The error "Could not find the table 'public.developers'" means you need to run the database schema in Supabase.

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Schema

1. Open the file `SUPABASE_SCHEMA.sql` in this project
2. Copy **ALL** the contents (Ctrl+A, Ctrl+C / Cmd+A, Cmd+C)
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

### Step 3: Verify Tables Were Created

After running the SQL, you should see:
- ✅ Success message
- Tables created: `developers`, `games`, `game_builds`, `categories`, `game_analytics`

You can verify by going to **Table Editor** in Supabase and checking if these tables exist.

### Step 4: Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name it: `game-builds`
4. Make it **Public** (or configure RLS for authenticated access)
5. Click **Create bucket**

### Step 5: Test Again

Now try uploading a game again. The error should be gone!

## 🔍 Troubleshooting

### If you get permission errors:
- Make sure you're using the SQL Editor (not the Table Editor)
- The SQL should run as the database owner

### If tables still don't appear:
- Refresh the Supabase dashboard
- Check the SQL Editor for any error messages
- Make sure you copied the entire schema file

### If you see "relation already exists":
- That's okay! The `IF NOT EXISTS` clauses prevent errors
- The schema is idempotent - safe to run multiple times

## 📋 What the Schema Creates

- ✅ `developers` table - Developer profiles
- ✅ `games` table - Game metadata
- ✅ `game_builds` table - APK/IPA file records
- ✅ `categories` table - Game categories (with default data)
- ✅ `game_analytics` table - Analytics tracking
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for automatic updates

