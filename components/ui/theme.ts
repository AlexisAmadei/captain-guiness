import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#fff7e8" },
          100: { value: "#fdecc8" },
          200: { value: "#f9da97" },
          300: { value: "#f4c56c" },
          400: { value: "#eead46" },
          500: { value: "#e08f1e" },
          600: { value: "#c87417" },
          700: { value: "#a95715" },
          800: { value: "#804014" },
          900: { value: "#5f2e10" },
          950: { value: "#381a09" },
        },
      },
      fonts: {
        heading: { value: '"Geist", sans-serif' },
        body: { value: '"Geist", sans-serif' },
      },
      radii: {
        soft: { value: "1rem" },
        cloud: { value: "1.5rem" },
        panel: { value: "1.75rem" },
      },
      shadows: {
        soft: { value: "0 12px 40px rgba(59, 41, 16, 0.08)" },
        lifted: { value: "0 24px 70px rgba(59, 41, 16, 0.14)" },
      },
    },
    semanticTokens: {
      colors: {
        "app.canvas": { value: { _light: "#f6f0e7", _dark: "#101114" } },
        "app.surface": { value: { _light: "rgba(255, 255, 255, 0.72)", _dark: "rgba(23, 24, 28, 0.78)" } },
        "app.surfaceSolid": { value: { _light: "#fffaf3", _dark: "#17181d" } },
        "app.border": { value: { _light: "#e6d8c5", _dark: "#2d3038" } },
        "app.fg": { value: { _light: "#24190e", _dark: "#f5efe3" } },
        "app.muted": { value: { _light: "#766554", _dark: "#b4ab9d" } },
        "app.subtle": { value: { _light: "#8b7d6f", _dark: "#8d8f99" } },
        "app.accent": { value: { _light: "#c87e1d", _dark: "#f0aa4a" } },
        "app.accentFg": { value: { _light: "#fff8ec", _dark: "#271500" } },
        "app.danger": { value: { _light: "#c23b39", _dark: "#ff9b92" } },
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "{colors.brand.50}" },
          fg: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" } },
          muted: { value: "{colors.brand.100}" },
          subtle: { value: "{colors.brand.200}" },
          emphasized: { value: "{colors.brand.300}" },
          focusRing: { value: "{colors.brand.500}" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);