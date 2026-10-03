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

/** Devtools Projection
 * role: developer projection, that is, not execution ownership, not artifacts ownership, not source of truth
 * rule: snapshot never duplicates execution-owned objects
 *
 */
export interface ULDEDevtoolsSnapshot {
  executionContext: ULDEExecutionContext;
  frameHistory: ULDEFrame[];
  analytics: ULDEAnalyticsSnapshot;
}

/**
 * Cross-execution analytics
 */
export interface ULDEAnalyticsSnapshot {
  timeline: ULDETimelinePoint[]; // visual analytics
  heatMap: ULDEHeatmapCell[]; // performance anlytics
  trends: ULDETrendSnapshot; // trend anaytics
  pluginStats: ULDEPluginStatistics[]; // aggregation analytics
}

export interface ULDETrendSnapshot {
  averageFrameDuration: number;
  worstFrameDuration: number;
  averagePluginDuration: number;
  slowestPlugin?: {
    pluginName: string;
    averageDuration: number;
  };
  regressionDetected: boolean;
}

/**
 * Plugin statistics - for future devtools tab
 */
export interface ULDEPluginStatistics {
  pluginName: string;
  pluginKind: ULDEPluginKind;
  executions: number;
  averageDuration: number;
  maxDuration: number;
  totalDuration: number;
}
