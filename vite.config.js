import { defineConfig } from "vite";

export default defineConfig({
  server: {
    fs: {
      strict: false,
    },
  },
  cacheDir: "./.vite-cache",
});
