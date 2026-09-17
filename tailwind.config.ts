import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FBF9F5",
        ink: "#2A2830",
        "ink-soft": "#6B6772",
        berry: {
          50: "#FBF1F1",
          100: "#F3DCDD",
          300: "#DA9CA0",
          500: "#B85A6B",
          600: "#9C4A5A",
          700: "#7C3A48",
        },
        slate: {
          50: "#F1F4F4",
          200: "#CFDBDC",
          500: "#4A6670",
          600: "#3A525B",
        },
        sage: {
          50: "#F1F5EE",
          200: "#D3E2C9",
          500: "#5C8A5C",
          600: "#476E48",
        },
        clay: {
          50: "#FBF0EC",
          300: "#E3AD97",
          500: "#C4553D",
          600: "#A6432E",
        },
        gold: {
          50: "#FBF4E4",
          300: "#E9CD8B",
          500: "#C99A3E",
          600: "#A87D2D",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "1.25rem",
        sheet: "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(42,40,48,0.04), 0 8px 24px -12px rgba(42,40,48,0.12)",
        lift: "0 2px 8px rgba(42,40,48,0.06), 0 16px 32px -16px rgba(42,40,48,0.18)",
      },
      keyframes: {
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.92) translateY(6px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "check-pop": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.28s cubic-bezier(0.16,1,0.3,1)",
        "slide-up": "slide-up 0.32s cubic-bezier(0.16,1,0.3,1)",
        "check-pop": "check-pop 0.5s cubic-bezier(0.16,1,0.3,1)",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
