# Gaming Store Dashboard - Setup Guide

## 🚀 Quick Start

### 1. Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your Project URL and Publishable (anon) key

2. **Run Database Schema**
   - Open Supabase SQL Editor
   - Copy and paste the contents of `SUPABASE_SCHEMA.sql`
   - Execute the SQL script
   - This creates all necessary tables, indexes, and RLS policies

3. **Create Storage Bucket**
   - Go to Storage in Supabase dashboard
   - Create a new bucket named `game-builds`
   - Set it to **Public** (or configure RLS policies for authenticated access)
   - This bucket will store APK/IPA files

4. **Environment Variables**
   - Create a `.env` file in the project root:
   ```env
   PUBLIC_SUPABASE_URL=your_supabase_project_url
   PUBLIC_SUPABASE_ANON_KEY=your_publishable_key
   ```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Run Development Server

```bash
yarn dev
```

Visit `http://localhost:4321`

## 📁 Project Structure

```
src/
├── components/
│   ├── DashboardHome.tsx      # Main dashboard with stats
│   ├── DashboardStats.tsx      # Stats cards component
│   ├── RecentActivity.tsx      # Activity feed
│   ├── GameUpload.tsx          # Game upload form
│   ├── GameList.tsx           # Games management table
│   ├── GameDetail.tsx          # Individual game details
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── ProfileModal.tsx        # User profile modal
│   ├── SettingsModal.tsx       # Settings with theme toggle
│   └── ...
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── supabase-types.ts      # TypeScript types
│   ├── fileUpload.ts          # File upload utilities
│   └── theme.ts               # Theme configuration
└── pages/
    ├── index.astro            # Dashboard home
    ├── games.astro             # Games list page
    ├── upload.astro            # Upload page
    └── ...
```

## 🎨 Design System

See `DESIGN_SYSTEM.md` for complete design guidelines including:
- Color palettes (light/dark mode)
- Typography scale
- Spacing system
- Component guidelines

## 🔐 Authentication Flow

1. Users sign up/sign in via Supabase Auth
2. On first login, a developer profile is automatically created
3. All game data is scoped to the developer via RLS policies

## 📤 File Upload

The system supports:
- **Android**: `.apk` files
- **iOS**: `.ipa` or `.zip` files
- **Max size**: 500MB
- **Chunked uploads** for large files (simplified implementation)

Files are stored in Supabase Storage bucket `game-builds`.

## 🗄️ Database Schema

### Tables
- `developers` - Developer profiles
- `games` - Game metadata
- `game_builds` - APK/IPA file records
- `categories` - Game categories
- `game_analytics` - Analytics data (optional)

### Row Level Security (RLS)
All tables have RLS enabled. Users can only access their own data.

## 🎯 Features Implemented

✅ **Dashboard Home**
- Stats cards (total games, downloads, revenue, pending reviews)
- Recent activity feed
- Quick actions

✅ **Game Upload**
- Metadata form (title, description, category, price, version)
- Drag-and-drop file uploader
- Progress tracking
- File validation

✅ **Game Management**
- Games list with filtering and search
- Status indicators (Draft, Pending Review, Live, Rejected)
- Download and rating stats
- Delete functionality

✅ **Game Details**
- Overview tab with game information
- Builds history tab
- Version tracking

✅ **Settings**
- Dark mode toggle
- Notification preferences
- Language selection
- Privacy links

✅ **Sidebar Navigation**
- Dashboard
- My Games
- Upload Game
- Profile & Settings modals
- Logout

## 🔧 Customization

### Adding New Categories
Edit the `SUPABASE_SCHEMA.sql` file and add to the categories INSERT statement.

### Styling
- Tailwind CSS for utility classes
- HeroUI for components
- Custom theme tokens in `tailwind.config.ts`

### File Upload Limits
Modify `CHUNK_SIZE` and max file size in `src/lib/fileUpload.ts`.

## 🚨 Important Notes

1. **Storage Bucket**: Make sure the `game-builds` bucket exists and is configured correctly
2. **RLS Policies**: All RLS policies are set up in the schema - users can only access their own data
3. **File Size**: Large file uploads (>50MB) use a simplified chunked approach. For production, consider implementing proper resumable uploads
4. **Dark Mode**: Theme preference is stored in localStorage

## 📝 Next Steps

- [ ] Implement proper resumable file uploads
- [ ] Add screenshot upload functionality
- [ ] Implement analytics dashboard
- [ ] Add email notifications
- [ ] Add game icon upload
- [ ] Implement version management UI
- [ ] Add bulk operations

## 🐛 Troubleshooting

**Sidebar not showing?**
- Make sure you're logged in
- Check browser console for errors

**File upload failing?**
- Verify storage bucket exists and is public
- Check file size limits
- Verify Supabase credentials

**Database errors?**
- Ensure schema has been run
- Check RLS policies are enabled
- Verify user is authenticated

