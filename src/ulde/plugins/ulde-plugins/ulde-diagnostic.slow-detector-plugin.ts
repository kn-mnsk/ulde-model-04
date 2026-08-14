// src/plugins/ulde-plugins/ulde-diagnostic-plugins.ts

import { DocsPlugin } from "../../core/ulde-plugin-registry.service";

export const SlowPluginDetector: DocsPlugin = {
  name: "diagnostic.slow-detector",
  description: "Warns when plugin execution exceeds threshold",
  hooks: {
    async onAfterRender(ctx) {
      const timings = window.ULDE.timings; // ULDE exposes timing store
      const threshold = 8; // ms

      for (const t of timings) {
        if (t.duration > threshold) {
          console.warn(
            `[ULDE] Plugin "${t.plugin}" exceeded ${threshold}ms: ${t.duration}ms`
          );
        }
      }
    }
  }
};
