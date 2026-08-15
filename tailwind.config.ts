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
        background: "var(--background)",
        foreground: "var(--foreground)",
        gov: {
          navy: "#1A3C6E",
          green: "#2E7D32",
          gold: "#C9A84C",
          bg: "#F5F7FA",
          text: "#0D2137",
        },
      },
    },
  },
  plugins: [],
};
export default config;
