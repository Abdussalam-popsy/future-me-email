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
        'sacramento': ['"Sacramento"', 'cursive'],
      },
      colors: {
        'primary': '#0B1431',
        'primary-blue': '#2188FF',
        'bg-light': '#EEF6FF',
      },
    },
  },
  plugins: [],
}