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
          50: "#f0f7fa",
          100: "#d9eef5",
          200: "#b3dde9",
          300: "#7cc2d6",
          400: "#3f9fbb",
          500: "#26839f",
          600: "#1f6a85",
          700: "#1e566d",
          800: "#1f485b",
          900: "#1e3d4e",
          950: "#0f2734",
        },
        teal: {
          accent: "#0d9488",
          soft: "#14b8a6",
        },
        gold: {
          soft: "#c9a227",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,39,52,0.08), 0 8px 24px rgba(15,39,52,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
