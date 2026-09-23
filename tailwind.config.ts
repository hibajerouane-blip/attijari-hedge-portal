import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bank: {
          50: "#F7F5F2",
          100: "#EFEBE6",
          200: "#E0DAD2",
          300: "#C9C0B5",
          400: "#A89F94",
          500: "#777777",
          600: "#5C564F",
          700: "#3F3A35",
          800: "#2E2C38",
          900: "#202024",
          950: "#16161A",
        },
        brand: {
          orange: "#FFB900",
          "orange-dark": "#F7B500",
          "orange-light": "#FFD24D",
          "orange-soft": "#FFF8E6",
          red: "#EE5B47",
          "red-dark": "#D94A38",
          "red-soft": "#FDEEEB",
          ink: "#2E2C38",
          bar: "#202024",
          light: "#F4F4F4",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(32,32,36,0.06), 0 8px 28px rgba(32,32,36,0.06)",
        hero: "0 20px 50px rgba(238,91,71,0.12)",
      },
      backgroundImage: {
        "hero-awb":
          "linear-gradient(135deg, #202024 0%, #2E2C38 45%, #3A2830 100%)",
        "mark-awb":
          "linear-gradient(160deg, #FFB900 0%, #FFB900 48%, #EE5B47 52%, #EE5B47 100%)",
        "pattern-dots":
          "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
export default config;
