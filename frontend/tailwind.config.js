/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12161C',       // headings / primary text
        body: '#4B5563',      // secondary text
        navy: {
          DEFAULT: '#0F1B2D', // admin sidebar, dark accents, dashboard strip
          light: '#1C2E47',
        },
        emerald: {
          DEFAULT: '#0E9F6E', // pricing
          dark: '#087A56',
        },
        amber: {
          DEFAULT: '#D97706', // featured / premium badges
        },
        line: '#E6E9EE',      // hairline borders
        surface: '#F7F8FA',   // section backgrounds
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '20px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(15, 27, 45, 0.06)',
        cardHover: '0 16px 40px rgba(15, 27, 45, 0.14)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(10px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        slideUp: 'slideUp 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
};
