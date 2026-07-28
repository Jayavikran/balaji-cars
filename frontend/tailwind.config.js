/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F0F10',       // headings / primary text
        body: '#5E636B',      // secondary text
        navy: {
          DEFAULT: '#0F0F10', // luxury dealership dark base
          light: '#1E1E20',
        },
        emerald: {
          DEFAULT: '#F4B400', // dealership gold
          dark: '#D39B00',
        },
        amber: {
          DEFAULT: '#F4B400', // featured / premium badges
        },
        line: '#E9E9E9',      // hairline borders
        surface: '#F8F8F8',   // section backgrounds
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '22px',
      },
      boxShadow: {
        card: '0 12px 40px rgba(0, 0, 0, 0.08)',
        cardHover: '0 18px 46px rgba(0, 0, 0, 0.12)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(10px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        slideUp: 'slideUp 0.4s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
