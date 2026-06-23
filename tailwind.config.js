/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#0B0E1F',
        'bg-panel': '#141A33',
        'bg-panel-2': '#1B2342',
        accent: '#5B6CFF',
        'accent-2': '#8A7CFF',
        gold: '#E8B84B',
        'text-hi': '#EDEFFA',
        'text-mid': '#A6ADCB',
        'text-dim': '#6B7299',
        stroke: '#262E4E',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        glow: '0 0 80px -20px rgba(91,108,255,0.45)',
        panel: '0 8px 30px -12px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'slide-up': 'slide-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
