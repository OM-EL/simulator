/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Revolut colors from PRD
        'electric-purple': '#6E4CE5',
        'sky-blue': '#81B2F1',
        'midnight': '#261073',
        'indigo': '#2C1385',
        'mist': '#CFB9C4',
        'charcoal': '#39343B',
      },
      fontFamily: {
        'aeonik': ['Aeonik Pro', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'revolut-gradient': 'linear-gradient(45deg, #6E4CE5, #81B2F1)',
      },
    },
  },
  plugins: [],
}