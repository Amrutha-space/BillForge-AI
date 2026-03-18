import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "Arial"]
      },
      colors: {
        "fintech-bg": "#060712"
      },
      boxShadow: {
        "soft-xl": "0 24px 60px rgba(0,0,0,0.45)"
      }
    }
  },
  plugins: []
} satisfies Config;

