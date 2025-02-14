/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./node_modules/preline/preline.js",
  ],
  darkMode: "class",
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: "#000000",
      white: "#ffffff",
      gray: colors.gray,
      neutral: colors.neutral,  // Used mainly for text color
      green: {
        50: "#f7f9f8", // Verde muy claro (para fondos suaves)
        100: "#e8f1ea", // Verde pastel
        200: "#d0e4d3", // Verde claro
        300: "#b6d6ba", // Verde natural
        400: "#8eb895", // Verde del logo, más cálido
        500: "#6d9873", // Verde destacado para textos o botones
        600: "#547b5a", // Verde más oscuro para énfasis
        700: "#3c5f43", // Verde oscuro
        800: "#2a4531", // Verde profundo para contrastes
        900: "#1a2d20", // Verde más oscuro, para modos oscuros
      },
      brown: {
        50: "#f9f5f2",
        100: "#efe6df",
        200: "#dcc8be",
        300: "#c4a497",
        400: "#a97f6f",
        500: "#A0522D", // Marrón medio
        600: "#8B4513", // Marrón oscuro
        700: "#5C3317", // Marrón más oscuro
        800: "#3f2316",
        900: "#241208",
      },
      yellow: {
        50: "#fefce8",
        100: "#fef9c3",
        400: "#facc15",
        500: "#eab308",
      }, // Amarillo para acentos
      red: colors.red, // Usado para alertas o íconos específicos
      zinc: colors.zinc, // Usado principalmente para sombras y bordes
    },
    extend: {},
  },
  plugins: [
    require("tailwindcss/nesting"),
    require("preline/plugin"),
    require("@tailwindcss/forms"),
  ],
};
