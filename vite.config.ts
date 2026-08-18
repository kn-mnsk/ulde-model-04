// vite.config.ts

// Resolve ULDE aliases

import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@ulde/core": path.resolve(__dirname, "./src/ulde/core"),
      "@ulde/engine": path.resolve(__dirname, "./src/ulde/engine"),
      "@ulde/plugins": path.resolve(__dirname, "./src/ulde/plugins"),
      "@ulde/tools": path.resolve(__dirname, "./src/ulde/tools"),
      "@ulde/types": path.resolve(__dirname, "./src/ulde/types"),
      "@ulde/viewer": path.resolve(__dirname, "./src/ulde/viewer")
    }

  }
});
