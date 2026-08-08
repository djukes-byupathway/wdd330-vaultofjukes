import { resolve } from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: "src",

  plugins: [tailwindcss()],

  build: {
    outDir: "../dist",
    emptyOutDir: true,

    //seems like a node version upgrade caused me to have problem with __dirname so had to add some import statements

    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "src/index.html"),
        characterGenerator: resolve(
          import.meta.dirname,
          "src/character-generator/index.html",
        ),
        paintPalette: resolve(
          import.meta.dirname,
          "src/paint-palette/index.html",
        ),
        projects: resolve(import.meta.dirname, "src/projects/index.html"),
        about: resolve(import.meta.dirname, "src/about/index.html"),
      },
    },
  },
});
