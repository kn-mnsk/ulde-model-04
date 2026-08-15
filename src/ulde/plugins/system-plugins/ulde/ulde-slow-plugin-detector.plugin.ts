// src/plugins/system-plugins/ulde/ulde-slow-pluging-detector.plugins.ts

import { ULDEPlugin } from "../../../types/ulde.types";

export const SlowPluginDetector: ULDEPlugin = {
  pluginKind: 'ulde',
  name: "SlowPluginDetector",
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
