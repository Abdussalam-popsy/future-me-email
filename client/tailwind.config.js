/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter-tight': ['"Inter Tight"', 'sans-serif'],
        'sacramento': ['"Sacramento"', 'cursive'],
      },
      colors: {
        'primary': '#0B1431',
        'primary-blue': '#2090FF',
        'bg-light': '#EEF6FF',
      },
    },
  },
  plugins: [],
}