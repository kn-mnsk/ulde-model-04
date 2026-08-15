// src/plugins/system-plugins/ulde/ulde-timeline-profiler.plugin.ts

import { ULDEPlugin } from "../../../types/ulde.types";

export const TimelineProfiler: ULDEPlugin = {
  pluginKind: 'ulde',
  name: "TimelineProfiler",
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
