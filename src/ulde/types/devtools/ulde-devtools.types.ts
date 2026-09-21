// src/ulde/types/devtools/ulde-devtools.types.ts

import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";
import { ULDEPluginKind, ULDEPluginExecutionHook } from "../plugin/ulde-plugin.types";

// ---------------------------------------------------------
// ULDE DevTools Types
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
  lifecyclePhase: ULDELifecyclePhase;
  intensity: number; // normalized 0–1
}

export type ULDEDevToolsTab =
  | 'diagnostics'
  | 'timeline'
  | 'profiler'
  | 'heatmap'
  | 'inspector'
  | 'frames'
  | 'plugins'
  | 'sparkline';

  export type ULDEDevtoolsInspectorTab =
  | 'ast'
  | 'layout'
  | 'sections'
  | 'toc'
  | 'anchors'
  // | 'frame'

