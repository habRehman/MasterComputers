/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in-up':   'fadeInUp 0.5s ease-out both',
        'fade-in':      'fadeIn 0.4s ease-out both',
        'scale-in':     'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-right':  'slideInRight 0.35s ease-out both',
        'bounce-in':    'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        'float':        'float 3s ease-in-out infinite',
        'gradient':     'gradientShift 8s ease infinite',
        'shimmer':      'shimmer 1.5s infinite',
        'spin-slow':    'spinSlow 3s linear infinite',
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
        'fab-ring':     'fabRing 1.8s ease-out infinite',
        'wiggle':       'wiggle 0.4s ease-in-out',
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring':     'cubic-bezier(0.34, 1.3,  0.64, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      boxShadow: {
        'glow':    '0 0 20px rgba(59, 130, 246, 0.35)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.30)',
        'card':    '0 4px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 12px 28px rgba(0,0,0,0.12)',
      },
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
}
