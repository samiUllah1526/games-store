import type { Config } from 'tailwindcss'
import { heroui } from '@heroui/theme'

export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './node_modules/@heroui/theme/dist/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gaming: {
          primary: {
            DEFAULT: '#6366F1',
            light: '#818CF8',
            dark: '#4F46E5',
          },
          secondary: {
            DEFAULT: '#8B5CF6',
            light: '#A78BFA',
            dark: '#7C3AED',
          },
          accent: {
            DEFAULT: '#EC4899',
            light: '#F472B6',
            dark: '#DB2777',
          },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [heroui()],
} satisfies Config

