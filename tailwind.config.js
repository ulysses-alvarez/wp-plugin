/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #000000)',
          hover: 'var(--color-primary-hover, #1a1a1a)',
          light: 'var(--color-primary-light, #fbfbfb)',
          dark: 'var(--color-primary, #000000)',
          text: 'var(--color-primary-text, #ffffff)',
          'light-text': 'var(--color-primary-light-text, #000000)'
        },
        sidebar: {
          DEFAULT: '#f3f4f6',
          hover: '#e5e7eb',
          border: '#d1d5db',
          text: '#374151',
          'text-light': '#6b7280'
        },
        secondary: {
          DEFAULT: '#64748b',
          hover: '#475569',
          light: '#f1f5f9'
        },
        success: {
          DEFAULT: '#10b981',
          light: '#d1fae5',
          dark: '#059669'
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
          dark: '#dc2626'
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
          dark: '#d97706'
        },
        info: {
          DEFAULT: '#3b82f6',
          light: '#dbeafe',
          dark: '#2563eb'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
