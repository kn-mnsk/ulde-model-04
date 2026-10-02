// src/ulde/types/devtools/ulde-devtools.types.ts

import { ULDEExecutionContext } from "@ulde/types/context";
import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";

import { ULDEPluginKind, ULDEPluginExecutionHook } from "../plugin/ulde-plugin.types";
import { ULDEFrame } from "@ulde/types/frame";
import { ULDEPluginTiming } from "@ulde/types/timing";
import { ULDEDiagnostic } from "@ulde/types/diagnostics";

// ---------------------------------------------------------
// ULDE DevTools Types
// ---------------------------------------------------------

export interface ULDETimelinePoint {
  frameId: string;
  timeStamp: number;
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

export interface ULDEDevtoolsSnapshot {
  executionContext: ULDEExecutionContext;
  frame: ULDEFrame;
  pluginTimings: ULDEPluginTiming[];
  diagnostics: ULDEDiagnostic[];
  timeline: ULDETimelinePoint[];
  heatMap: ULDEHeatmapCell[];
}
