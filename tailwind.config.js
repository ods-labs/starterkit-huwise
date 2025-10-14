import {heroui} from "@heroui/theme"
import { sharedColors, stateColors } from "./src/config/colors.js"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    screens: {
      'sm': '375px',
      'md': '760px',
      'lg': '1024px',
      'xl-small': '1180px',
      'xl': '1280px',
      '2xl': '1680px',
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        // Couleurs principales
        ...sharedColors,
        // Couleurs d'état
        ...stateColors
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    defaultTheme: "mon-theme",
    themes: {
        "mon-theme": {
        extend: "light",
        colors: sharedColors,
      },
    },
  })],
}

module.exports = config;
