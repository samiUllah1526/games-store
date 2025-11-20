// Theme configuration for Gaming Store Dashboard

export const lightTheme = {
  colors: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    accent: '#EC4899',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      muted: '#9CA3AF',
    },
  },
};

export const darkTheme = {
  colors: {
    primary: '#818CF8',
    secondary: '#A78BFA',
    accent: '#F472B6',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    background: '#0F172A',
    surface: '#1E293B',
    text: {
      primary: '#F1F5F9',
      secondary: '#CBD5E1',
      muted: '#94A3B8',
    },
  },
};

export type Theme = typeof lightTheme;

