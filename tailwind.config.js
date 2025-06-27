/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        unfocused: "#8B8B8B",
      },
    },
  },
  plugins: [],
};
