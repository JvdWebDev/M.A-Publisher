import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        gujarati: ['Noto Sans Gujarati', 'sans-serif'], // Agar aapne font setup kiya hai
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;