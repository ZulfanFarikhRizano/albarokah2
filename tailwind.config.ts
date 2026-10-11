import type { Config } from "tailwindcss";

const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: withAlpha("--c-background"),
        foreground: withAlpha("--c-foreground"),
        muted: withAlpha("--c-muted"),
        border: withAlpha("--c-border"),
        primary: {
          50: withAlpha("--c-primary-50"),
          100: withAlpha("--c-primary-100"),
          200: withAlpha("--c-primary-200"),
          400: withAlpha("--c-primary-400"),
          500: withAlpha("--c-primary-500"),
          600: withAlpha("--c-primary-600"),
          700: withAlpha("--c-primary-700"),
          900: withAlpha("--c-primary-900"),
          DEFAULT: withAlpha("--c-primary-600"),
        },
        accent: {
          100: withAlpha("--c-accent-100"),
          300: withAlpha("--c-accent-300"),
          400: withAlpha("--c-accent-400"),
          500: withAlpha("--c-accent-500"),
          DEFAULT: withAlpha("--c-accent-500"),
        },
        onAccent: withAlpha("--c-on-accent"),
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        arabic: ["var(--font-amiri)", "serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(21,34,30,.04), 0 8px 24px rgba(21,34,30,.05)",
      },
    },
  },
  plugins: [],
};

export default config;
