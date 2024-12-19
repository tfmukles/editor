import type { Config } from 'tailwindcss';

let font_base = 16;
let font_scale = 1.125;
let h6 = font_base / font_base;
let h5 = h6 * font_scale;
let h4 = h5 * font_scale;
let h3 = h4 * font_scale;
let h2 = h3 * font_scale;
let h1 = h2 * font_scale;

const config: Config = {
  content: [
    './src/layouts/**/*.{js,ts,jsx,tsx}',
    './src/content/**/*.{md,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/editor/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', 'class'],
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwind-bootstrap-grid')({
      generateContainer: false,
      gridGutterWidth: '2rem',
      gridGutters: {
        1: '0.25rem',
        2: '0.5rem',
        3: '1rem',
        4: '1.5rem',
        5: '3rem',
      },
    }),
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backgroundImage: {
        'transparent-image': "url('/images/bg-transparent.png')",
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 2px)',
      },
      colors: {
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background: 'hsl(var(--background))',
        border: 'hsl(var(--border))',
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          foreground: 'hsl(var(--brand-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        dark: 'hsl(var(--dark-color))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        foreground: 'hsl(var(--foreground))',
        highlight: {
          DEFAULT: 'hsl(var(--highlight))',
          foreground: 'hsl(var(--highlight-foreground))',
        },
        input: 'hsl(var(--input))',
        light: 'hsl(var(--light-color))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        ring: 'hsl(var(--ring))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        text: {
          dark: 'hsl(var(--text-dark-color))',
          light: 'hsl(var(--text-light-color))',
        },
      },
      fontFamily: {
        primary: 'var(--font-primary)',
        secondary: 'var(--font-secondary)',
      },
      fontSize: {
        base: font_base + 'px',
        h1: h1 + 'rem',
        'h1-sm': h1 * 0.8 + 'rem',
        h2: h2 + 'rem',
        'h2-sm': h2 * 0.8 + 'rem',
        h3: h3 + 'rem',
        'h3-sm': h3 * 0.8 + 'rem',
        h4: h4 + 'rem',
        h5: h5 + 'rem',
        h6: h6 + 'rem',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
    },
    screens: {
      '2xl': '1536px',
      lg: '1024px',
      'main-hover': {
        raw: '(hover: hover)',
      },
      md: '768px',
      sm: '540px',
      xl: '1280px',
    },
  },
};
export default config;
