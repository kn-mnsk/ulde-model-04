// src/ulde/plugins/system/ulde/ulde-slow-pluging-detector.plugin.ts

import { ULDEExecutionContext } from "@ulde/types";
import { ULDEPlugin, ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";
import { ULDEPluginTiming } from "@ulde/types/timing";

export class ULDESlowPluginDetectorPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'ulde';
  pluginName = "SlowPluginDetector";
  description = "Warns when plugin execution exceeds threshold";
  enabled = true;
  async run(ctx: ULDEExecutionContext) {


    if (ctx.lifecyclePhase !== 'afterRender') return;
    if (ctx.artifacts.frame === undefined) return;

    const timings: ULDEPluginTiming[] = ctx.artifacts.frame.pluginTimings; // ULDE exposes timing store
    // const timings = window.ULDE.timings; // ULDE exposes timing store
    const threshold = 200; // ms

    for (const t of timings) {
      if (t.duration > threshold) {

        ctx.artifacts.diagnostics.push({
          level: "warn",
          message: `[ULDE] Plugin "${t.pluginName}" exceeded ${threshold}ms: ${t.duration}ms`,
          lifecyclePhase: `${ctx.lifecyclePhase}`,
          pluginKind: this.pluginKind,
          pluginName: this.pluginName
        })
        // console.warn(
        //   `[ULDE] Plugin "${t.pluginName}" exceeded ${threshold}ms: ${t.duration}ms`
        // );
      }
    }
  };

}




//legacy
// export const ULDESlowPluginDetectorPlugin: ULDEPlugin = {
//   pluginKind: 'ulde',
//   pluginName: "SlowPluginDetector",
//   description: "Warns when plugin execution exceeds threshold",
//   enabled: true,
//   hooks: {
//     async onAfterRender(ctx) {
//       if (ctx.artifacts.frame === undefined) return;

//       const timings: ULDEPluginTiming[] = ctx.artifacts.frame.pluginTimings; // ULDE exposes timing store
//       // const timings = window.ULDE.timings; // ULDE exposes timing store
//       const threshold = 8; // ms

//       for (const t of timings) {
//         if (t.duration > threshold) {
//           console.warn(
//             `[ULDE] Plugin "${t.pluginName}" exceeded ${threshold}ms: ${t.duration}ms`
//           );
//         }
//       }
//     }
//   }
// };
