/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary, #0f172a)",
          secondary: "var(--brand-secondary, #38bdf8)"
        }
      },
      boxShadow: {
        card: "0 20px 45px rgba(15,23,42,0.08)"
      }
    }
  },
  plugins: []
};
