# Gaming Store Dashboard - Design System

## 🎨 Theme & Aesthetic Guidelines

### Color Palettes

#### Light Mode
```css
Primary: #6366F1 (Indigo) - Gaming, tech-forward
Secondary: #8B5CF6 (Purple) - Creative, premium
Accent: #EC4899 (Pink) - Energy, excitement
Success: #10B981 (Green) - Live status, success
Warning: #F59E0B (Amber) - Pending, review
Danger: #EF4444 (Red) - Rejected, errors
Neutral: 
  - Gray 50: #F9FAFB
  - Gray 100: #F3F4F6
  - Gray 200: #E5E7EB
  - Gray 300: #D1D5DB
  - Gray 400: #9CA3AF
  - Gray 500: #6B7280
  - Gray 600: #4B5563
  - Gray 700: #374151
  - Gray 800: #1F2937
  - Gray 900: #111827
```

#### Dark Mode
```css
Primary: #818CF8 (Lighter Indigo) - Better contrast in dark
Secondary: #A78BFA (Lighter Purple)
Accent: #F472B6 (Lighter Pink)
Success: #34D399 (Lighter Green)
Warning: #FBBF24 (Lighter Amber)
Danger: #F87171 (Lighter Red)
Background:
  - Base: #0F172A (Slate 900)
  - Surface: #1E293B (Slate 800)
  - Elevated: #334155 (Slate 700)
Text:
  - Primary: #F1F5F9 (Slate 100)
  - Secondary: #CBD5E1 (Slate 300)
  - Muted: #94A3B8 (Slate 400)
```

### Typography

```css
Font Family: 'Inter', system-ui, sans-serif

Headers:
  - H1: 2.5rem (40px), font-weight: 700, line-height: 1.2
  - H2: 2rem (32px), font-weight: 700, line-height: 1.3
  - H3: 1.5rem (24px), font-weight: 600, line-height: 1.4
  - H4: 1.25rem (20px), font-weight: 600, line-height: 1.5

Body:
  - Large: 1.125rem (18px), font-weight: 400, line-height: 1.6
  - Base: 1rem (16px), font-weight: 400, line-height: 1.6
  - Small: 0.875rem (14px), font-weight: 400, line-height: 1.5
  - XSmall: 0.75rem (12px), font-weight: 400, line-height: 1.4

UI Labels:
  - Button: 0.875rem (14px), font-weight: 600
  - Label: 0.875rem (14px), font-weight: 500
  - Caption: 0.75rem (12px), font-weight: 400
```

### Iconography

- Style: Outlined with subtle fills for active states
- Size Scale: 16px, 20px, 24px, 32px
- Library: Heroicons or Lucide React
- Gaming Icons: Custom pixel-art style for game-related elements

### Spacing Scale

```css
0: 0px
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)
24: 6rem (96px)
```

### Border Radius

```css
None: 0
SM: 0.25rem (4px)
Base: 0.5rem (8px)
MD: 0.75rem (12px)
LG: 1rem (16px)
XL: 1.5rem (24px)
Full: 9999px
```

### Shadows

```css
Light Mode:
  - SM: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
  - Base: 0 1px 3px 0 rgba(0, 0, 0, 0.1)
  - MD: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
  - LG: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
  - XL: 0 20px 25px -5px rgba(0, 0, 0, 0.1)

Dark Mode:
  - SM: 0 1px 2px 0 rgba(0, 0, 0, 0.3)
  - Base: 0 1px 3px 0 rgba(0, 0, 0, 0.4)
  - MD: 0 4px 6px -1px rgba(0, 0, 0, 0.4)
  - LG: 0 10px 15px -3px rgba(0, 0, 0, 0.4)
  - XL: 0 20px 25px -5px rgba(0, 0, 0, 0.4)
```

### Component Guidelines

#### Cards
- Background: White (light) / Slate 800 (dark)
- Border: 1px solid Gray 200 (light) / Slate 700 (dark)
- Padding: 1.5rem (24px)
- Border Radius: 0.75rem (12px)
- Shadow: Base shadow

#### Buttons
- Primary: Indigo background, white text
- Secondary: Gray background, dark text
- Danger: Red background, white text
- Ghost: Transparent, colored text
- Size: SM (32px), MD (40px), LG (48px)

#### Inputs
- Border: 1px solid Gray 300 (light) / Slate 600 (dark)
- Focus: 2px solid Primary color
- Border Radius: 0.5rem (8px)
- Padding: 0.75rem (12px)

## 🎮 Gaming Aesthetic Elements

### Visual Style
- **Clean & Modern**: Minimal clutter, plenty of whitespace
- **Gaming Accents**: Subtle gradients, neon glows on hover
- **Professional**: Maintains business credibility
- **Interactive**: Smooth animations, micro-interactions

### Special Effects
- Subtle glow on primary buttons (box-shadow with primary color)
- Gradient backgrounds for hero sections
- Animated progress bars
- Smooth transitions (200-300ms)

## 📱 Responsive Breakpoints

```css
SM: 640px
MD: 768px
LG: 1024px
XL: 1280px
2XL: 1536px
```

