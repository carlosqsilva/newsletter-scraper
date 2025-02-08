import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs()],
  site: "https://carlosqsilva.github.io",
  base: "/newsletter-scraper",
  vite: {
    plugins: [tailwindcss()],
  },
});
