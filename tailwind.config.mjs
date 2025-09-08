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
      neutral: colors.neutral,
      
      // Colores principales basados en tu logo
      primary: {
        50: "#f8f9fa",   // Gris muy claro
        100: "#e9ecef",  // Gris claro del logo
        200: "#dee2e6",  // Plateado claro
        300: "#ced4da",  // Plateado medio
        400: "#adb5bd",  // Plateado
        500: "#6c757d",  // Gris medio del logo
        600: "#495057",  // Gris oscuro
        700: "#343a40",  // Negro grisáceo del logo
        800: "#212529",  // Negro del logo
        900: "#000000",  // Negro puro
      },
      
      // Colores de madera del logo
      wood: {
        50: "#fdf7f0",   // Muy claro
        100: "#f7e6d3",  // Claro
        200: "#efd3b7",  // Medio claro
        300: "#d4a574",  // Madera clara del logo
        400: "#c49660",  // Madera del logo
        500: "#b8935c",  // Madera principal
        600: "#a67c47",  // Madera oscura
        700: "#8b5a2b",  // Madera muy oscura
        800: "#6d4526",  // Marrón oscuro
        900: "#5c3317",  // Marrón muy oscuro
      },
      
      // Mantener algunos acentos para elementos específicos
      accent: {
        50: "#fff7ed",
        100: "#ffedd5", 
        200: "#fed7aa",
        300: "#fdba74",
        400: "#fb923c",  // Naranja para acentos
        500: "#f97316",  // Naranja principal
        600: "#ea580c",
        700: "#c2410c",
        800: "#9a3412",
        900: "#7c2d12",
      },
      
      // Verde más sutil para elementos de éxito
      success: {
        50: "#f0fdf4",
        100: "#dcfce7",
        200: "#bbf7d0",
        300: "#86efac",
        400: "#4ade80",
        500: "#22c55e",
        600: "#16a34a",
        700: "#15803d",
        800: "#166534",
        900: "#14532d",
      },
      
      // Rojos para alertas
      red: colors.red,
      zinc: colors.zinc,
    },
    extend: {
      // Gradientes personalizados
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #f8f9fa 0%, #dee2e6 50%, #495057 100%)',
        'wood-gradient': 'linear-gradient(135deg, #d4a574 0%, #c49660 50%, #a67c47 100%)',
        'hero-gradient': 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      },
      // Sombras personalizadas
      boxShadow: {
        'brand': '0 4px 6px -1px rgba(73, 80, 87, 0.1), 0 2px 4px -1px rgba(73, 80, 87, 0.06)',
        'brand-lg': '0 10px 15px -3px rgba(73, 80, 87, 0.1), 0 4px 6px -2px rgba(73, 80, 87, 0.05)',
        'wood': '0 4px 6px -1px rgba(196, 150, 96, 0.2), 0 2px 4px -1px rgba(196, 150, 96, 0.1)',
      }
    },
  },
  plugins: [
    require("tailwindcss/nesting"),
    require("preline/plugin"),
    require("@tailwindcss/forms"),
  ],
};