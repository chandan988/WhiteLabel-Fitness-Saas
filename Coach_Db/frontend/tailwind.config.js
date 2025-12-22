/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary, #0d9488)",
          secondary: "var(--brand-secondary, #115e59)",
          primaryHover: "var(--brand-primary-hover, #0b7f71)",
          secondaryHover: "var(--brand-secondary-hover, #0b4f4c)",
          surface: "var(--brand-surface, #f8fafc)",
          card: "var(--brand-card, #ffffff)",
          ink: "var(--brand-ink, #0f172a)",
          muted: "var(--brand-muted, #64748b)",
          border: "var(--brand-border, #e2e8f0)",
          buttonText: "var(--brand-button-text, #ffffff)"
        }
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 20px 45px var(--brand-shadow, rgba(15, 23, 42, 0.08))",
        soft: "0 12px 24px var(--brand-shadow, rgba(15, 23, 42, 0.08))"
      }
    }
  },
  plugins: []
};
