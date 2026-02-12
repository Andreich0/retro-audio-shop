import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // ТОВА Е НАЙ-ВАЖНАТА ЧАСТ!
    // Тук казваме на Tailwind къде да търси класовете.
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        // Добавяме шрифта, за да го познае от layout.tsx
        rajdhani: ['var(--font-rajdhani)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;