import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@ulde/types": path.resolve(__dirname, "src/ulde/types/ULDETypesModule"),
      "@ulde/types/*": path.resolve(__dirname, "src/ulde/types"),
      "@ulde/lifecycle": path.resolve(__dirname, "src/ulde/types/lifecycle"),
      "@ulde/plugin": path.resolve(__dirname, "src/ulde/types/plugin"),
      "@ulde/context": path.resolve(__dirname, "src/ulde/types/context"),
      "@ulde/timing": path.resolve(__dirname, "src/ulde/types/timing"),
      "@ulde/frame": path.resolve(__dirname, "src/ulde/types/frame"),
      "@ulde/diagnostic": path.resolve(__dirname, "src/ulde/types/diagnostic"),
      "@ulde/debug": path.resolve(__dirname, "src/ulde/types/debug")
    }
  }
});
