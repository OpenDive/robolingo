/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          steel: '#3C3C3C', // Dark gray instead of steel blue
          light: '#8D8D8D', // Light gray
          dark: '#1A1A1A', // Very dark gray
          accent: '#000000', // Black accent color for linework
        },
        secondary: {
          gray: '#F5F5F5',
          dark: '#333333',
          light: '#F0EBE0', // Light parchment color
        },
        blueprint: {
          bg: '#F5F0E1',     // Parchment background
          grid: '#E5DFD0',   // Slightly darker grid lines
          line: '#000000',   // Black for linework
          highlight: '#FFFFFF', // White highlight
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      backgroundImage: {
        'blueprint-grid': "url('/images/blueprint-grid.svg')",
        'floral-pattern': "url('/images/floral-pattern.svg')",
      },
      borderWidth: {
        '1': '1px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'spin-slow-reverse': 'spin 20s linear infinite reverse',
        'spin-very-slow': 'spin 40s linear infinite',
        'spin-reverse': 'spin 25s linear infinite reverse',
        'spin-slower': 'spin 30s linear infinite',
        'gear-rotate': 'gear-rotate 15s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      }
    },
  },
  plugins: [],
};