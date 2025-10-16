/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors as per PDF
        background: {
          primary: '#0f0f0f',
          secondary: '#1a1a1a',
        },
        surface: '#1a1a1a',
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          light: '#60a5fa',
        },
        accent: {
          DEFAULT: '#10b981',
          dark: '#059669',
          light: '#34d399',
        },
        text: {
          primary: '#ffffff',
          secondary: '#9ca3af',
          tertiary: '#6b7280',
        },
        border: {
          DEFAULT: '#2d2d2d',
          light: '#404040',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}