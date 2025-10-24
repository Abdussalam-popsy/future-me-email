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
        'fasthand': ['"Fasthand"', 'cursive'],
        'pacifico': ['Pacifico', 'cursive'],
        'tangerine': ['Tangerine', 'cursive'],
      },
      colors: {
        'primary': '#0B1431',
        'primary-blue': '#3B82F6',
        'bg-light': '#EDF3FF',
      },
    },
  },
  plugins: [],
}