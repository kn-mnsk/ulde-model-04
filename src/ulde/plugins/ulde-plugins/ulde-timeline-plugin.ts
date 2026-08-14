// src/plugins/ulde-plugins/ulde-timeline-plugin.ts

import { DocsPlugin } from "../../core/ulde-plugin-registry.service";


export const TimelineProfiler: DocsPlugin = {
  name: "timeline",
  description: "Logs ULDE phase durations to console",
  hooks: {
    onInit() {
      console.log("[ULDE] Timeline profiler initialized");
    },

    onDestroy() {
      console.log("[ULDE] Timeline profiler destroyed");
    }
  }
};
