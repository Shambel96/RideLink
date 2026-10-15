/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          850: '#172033',
          900: '#0F172A',
          950: '#0A0D14',
        },
        electric: {
          400: '#D9FF33',
          500: '#CCFF00',
          600: '#B5E600',
          700: '#99C200',
          glow: 'rgba(204, 255, 0, 0.25)',
          muted: 'rgba(204, 255, 0, 0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        cardHover: '0 12px 24px -4px rgba(10, 13, 20, 0.08), 0 4px 8px -2px rgba(10, 13, 20, 0.04)',
        limeGlow: '0 0 24px -2px rgba(204, 255, 0, 0.35)',
      },
    },
  },
  plugins: [],
};
