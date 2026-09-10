// src/ulde/types/debug/ulde-debug.types.ts

import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";
import { ULDEPluginKind, ULDEPluginHooks, ULDEPluginExecutionHook } from "../plugin/ulde-plugin.types";

// ---------------------------------------------------------
// ULDE Debug Tools Types
// ---------------------------------------------------------

export interface ULDETimelinePoint {
  frameId: string;
  totalDuration: number;
  phases: {
    lifecyclePhase: ULDELifecyclePhase;
    duration: number;
  }[];
}

export interface ULDEHeatmapCell {
  pluginName: string;
  pluginKind: ULDEPluginKind;
  hookName: ULDEPluginExecutionHook//keyof ULDEPluginHooks;
  intensity: number; // normalized 0–1
}
