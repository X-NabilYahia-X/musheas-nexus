
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Sora', 'sans-serif'],
        headline: ['DM Serif Display', 'serif'],
        code: ['DM Mono', 'monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
          strong: 'rgba(210,178,107,.25)',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Custom Musheas theme aliases for existing components
        surface1: '#0a1a1d',
        surface2: '#0d2226',
        gold: {
          DEFAULT: '#d2b26b',
          dark: '#b8903f',
        },
        teal: '#55aab4',
        green: '#3dba7e',
        red: '#e05c5c',
        text: '#e6f0ee',
      },
      borderRadius: {
        lg: '16px',
        md: '11px',
        sm: '8px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
