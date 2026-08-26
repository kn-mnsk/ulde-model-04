// src/ulde/plugins/system/ulde/ulde-slow-pluging-detector.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";
import { ULDEPluginTiming } from "@ulde/types/timing";

export const SlowPluginDetector: ULDEPlugin = {
  pluginKind: 'ulde',
  pluginName: "SlowPluginDetector",
  description: "Warns when plugin execution exceeds threshold",
  enabled: true,
  hooks: {
    async onAfterRender(ctx) {
      if (ctx.frame === undefined) return;
      
      const timings: ULDEPluginTiming[] = ctx.frame.pluginTimings; // ULDE exposes timing store
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
