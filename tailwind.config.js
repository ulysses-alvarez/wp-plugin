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
          DEFAULT: 'var(--color-primary, #216121)',
          hover: 'var(--color-primary-hover, #1a4d1a)',
          light: 'var(--color-primary-light, #e8f5e9)',
          dark: '#0d3d0d'
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
