// src/plugins/system-plugins/ulde/ulde-slow-pluging-detector.plugins.ts

import { ULDEPlugin } from "@ulde/types/plugin";
import { ULDEPluginTiming } from "@ulde/types/timing";

export const SlowPluginDetector: ULDEPlugin = {
  pluginKind: 'ulde',
  name: "SlowPluginDetector",
  description: "Warns when plugin execution exceeds threshold",
  enabled: true,
  hooks: {
    async onAfterRender(ctx) {
      const timings: ULDEPluginTiming[] = ctx.artifacts.timings.all(); // ULDE exposes timing store
      // const timings = window.ULDE.timings; // ULDE exposes timing store
      const threshold = 8; // ms

      for (const t of timings) {
        if (t.duration > threshold) {
          console.warn(
            `[ULDE] Plugin "${t.pluginName}" exceeded ${threshold}ms: ${t.duration}ms`
          );
        }
      }
    }
  }
};
