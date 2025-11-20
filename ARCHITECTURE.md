# Gaming Store Dashboard - Architecture & Engineering Guide

## 🏗️ Architecture Overview

### Frontend Stack
- **Framework**: Astro with React integration
- **UI Library**: HeroUI (NextUI fork)
- **Styling**: Tailwind CSS with custom gaming theme
- **State Management**: React Context (AuthProvider)
- **File Upload**: Custom chunked upload utility

### Backend Stack
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for APK/IPA files)
- **API**: Supabase REST API with Row Level Security

## 📐 Component Architecture

### Layout Structure
```
Layout.astro (Base HTML)
  └── HeroUIProvider (Theme provider)
      └── AuthProvider (Auth context)
          └── Sidebar (Navigation)
          └── Main Content (Page-specific)
```

### Page Components
- **HomePage**: Dashboard with stats and activity
- **GamesPage**: Game list with filtering
- **UploadPage**: Game upload form
- **GameDetail**: Individual game view (to be implemented as route)

### Reusable Components
- **DashboardStats**: Stat cards with icons
- **RecentActivity**: Activity feed component
- **GameUpload**: Upload form with drag-and-drop
- **GameList**: Table view with search/filter
- **GameDetail**: Tabs for overview and builds
- **Sidebar**: Navigation with modals
- **ProfileModal**: User profile display
- **SettingsModal**: Settings with theme toggle

## 🗄️ Database Design

### Entity Relationship
```
users (Supabase Auth)
  └── developers (1:1)
      └── games (1:many)
          └── game_builds (1:many)
          └── game_analytics (1:many)
categories (standalone)
```

### Key Design Decisions
1. **Developer Profile**: Separate table extending auth.users for additional metadata
2. **Game Builds**: Separate table for versioning and platform support
3. **Categories**: Normalized for consistency and filtering
4. **RLS**: All tables protected - users only see their own data

## 🔐 Security Architecture

### Row Level Security (RLS)
- **Developers**: Users can only access their own profile
- **Games**: Scoped to developer_id
- **Builds**: Scoped through games → developer relationship
- **Analytics**: Scoped through games → developer relationship

### File Upload Security
- Files stored in Supabase Storage with RLS
- File validation before upload (type, size)
- Unique file paths per game/version

## 📤 File Upload Strategy

### Current Implementation
- **Small files (<50MB)**: Direct upload
- **Large files (>50MB)**: Simplified chunked upload
- **Validation**: Client-side before upload
- **Progress**: Real-time progress tracking

### Production Recommendations
1. **Resumable Uploads**: Implement proper chunked upload with resume capability
2. **Server-side Validation**: Add backend validation for file integrity
3. **Virus Scanning**: Integrate virus scanning service
4. **CDN**: Use CDN for file delivery
5. **Compression**: Compress files before storage

## 🎨 Theming System

### Implementation
- **CSS Variables**: Tailwind with custom color tokens
- **Dark Mode**: Class-based (`dark:` prefix)
- **Persistence**: localStorage for theme preference
- **Initialization**: Script in Layout.astro

### Theme Tokens
- Primary: Indigo (#6366F1)
- Secondary: Purple (#8B5CF6)
- Accent: Pink (#EC4899)
- Status colors: Success, Warning, Danger

## 🔄 Data Flow

### Game Upload Flow
```
1. User fills form → Client validation
2. Create game record → Supabase
3. Upload file → Supabase Storage
4. Create build record → Supabase
5. Update game status → Pending Review
```

### Dashboard Data Flow
```
1. User authenticates → AuthProvider
2. Get developer ID → Supabase query
3. Fetch games → Filtered by developer_id
4. Calculate stats → Client-side aggregation
5. Display → React components
```

## 🚀 Performance Considerations

### Optimizations
- **Lazy Loading**: Components loaded on demand
- **Pagination**: Game lists can be paginated (future)
- **Caching**: Supabase client handles caching
- **Indexes**: Database indexes on foreign keys

### Future Optimizations
- **Image Optimization**: Compress and resize game icons
- **Virtual Scrolling**: For large game lists
- **Query Optimization**: Add database views for stats
- **CDN**: Serve static assets via CDN

## 🧪 Testing Strategy

### Recommended Tests
1. **Unit Tests**: Component logic, utilities
2. **Integration Tests**: Auth flow, file upload
3. **E2E Tests**: Complete user journeys
4. **Database Tests**: RLS policies, constraints

## 📦 Deployment

### Build Process
```bash
yarn build  # Astro build
```

### Environment Variables
- `PUBLIC_SUPABASE_URL`: Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key

### Supabase Setup
1. Run `SUPABASE_SCHEMA.sql` in SQL Editor
2. Create `game-builds` storage bucket
3. Configure RLS policies (included in schema)

## 🔧 Extensibility

### Adding Features
1. **New Pages**: Create component + Astro page
2. **New Tables**: Add to schema + create types
3. **New Components**: Follow existing patterns
4. **New Routes**: Add to Sidebar navigation

### API Extensions
- **Webhooks**: Supabase webhooks for events
- **Edge Functions**: For complex operations
- **Real-time**: Supabase real-time subscriptions

## 📚 Code Organization

### File Structure
```
src/
├── components/     # React components
├── lib/           # Utilities, types, configs
├── layouts/       # Astro layouts
└── pages/         # Astro pages (routes)
```

### Naming Conventions
- **Components**: PascalCase (e.g., `GameUpload.tsx`)
- **Utilities**: camelCase (e.g., `fileUpload.ts`)
- **Types**: camelCase with `-types` suffix
- **Pages**: kebab-case (e.g., `game-detail.astro`)

## 🎯 Best Practices

1. **Type Safety**: Use TypeScript types from `supabase-types.ts`
2. **Error Handling**: Try-catch blocks with user-friendly messages
3. **Loading States**: Show loading indicators during async operations
4. **Validation**: Client-side validation before API calls
5. **Accessibility**: Use semantic HTML and ARIA labels
6. **Responsive**: Mobile-first design approach

