/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mcgg: {
          gold: '#F0C040',
          blue: '#1E90FF',
          purple: '#9B59B6',
          dark: '#0D1117',
          card: '#161B22',
          border: '#30363D',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
