/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary, #0d9488)",
          secondary: "var(--brand-secondary, #115e59)"
        }
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 20px 45px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
