// /src/ulde/types/ulde-types.ts

// ---------------------------------------------------------
// ULDE Lifecycle Phases
// ---------------------------------------------------------

export type ULDELifecyclePhase =
  | 'init'
  | 'load'
  | 'render'
  | 'hydrate'
  | 'afterRender';

export interface ULDELifecyclePhaseTiming {
  lifecyclePhase: ULDELifecyclePhase;
  startTime: number;
  endTime: number;
  duration: number;
}

// ---------------------------------------------------------
// ULDE Plugin Kinds
// ---------------------------------------------------------

export type ULDEPluginKind =
  | 'content'
  | 'layout'
  | 'interactive'
  | 'navigation'
  | 'demo'
  | 'ulde';

// ---------------------------------------------------------
// ULDE Plugin Definition
// ---------------------------------------------------------

export interface ULDEPlugin {
  pluginKind: ULDEPluginKind;
  name: string;
  version?: string;
  description?: string;
  enabled?: boolean;
  hooks: ULDEPluginHooks;
}

// ---------------------------------------------------------
// ULDE Plugin Hooks
// ---------------------------------------------------------

export interface ULDEPluginHooks {
  onInit?(): void | Promise<void>;
  onPageLoad?(ctx: ULDEPageContext): void | Promise<void>;
  onBeforeRender?(ctx: ULDERenderContext): void | Promise<void>;
  onAfterRender?(ctx: ULDERenderContext): void | Promise<void>;
  onDestroy?(): void | Promise<void>;
}

// ---------------------------------------------------------
// ULDE Context Objects
// ---------------------------------------------------------

export interface ULDEPageContext {
  pageId: string;
  route: string;
  frontmatter: Record<string, any>;
  rawContent: string;
}

export interface ULDERenderContext {
  pageId: string;
  ast: any;
  html: string;
  layout: string;
}

// ---------------------------------------------------------
// ULDE Plugin Timing
// ---------------------------------------------------------

export interface ULDEPluginTiming {
  pluginName: string;
  pluginKind: ULDEPluginKind;
  hookName: keyof ULDEPluginHooks;
  lifecyclePhase: ULDELifecyclePhase;
  duration: number;
}

// ---------------------------------------------------------
// ULDE Frame
// ---------------------------------------------------------

export interface ULDEFrame {
  id: string;
  timestamp: number;
  phases: ULDELifecyclePhaseTiming[];
  pluginTimings: ULDEPluginTiming[];
}

// ---------------------------------------------------------
// ULDE Diagnostics
// ---------------------------------------------------------

export interface ULDEDiagnostic {
  level: 'info' | 'warn' | 'error';
  message: string;
  lifecyclePhase?: ULDELifecyclePhase;
  pluginName?: string;
}

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
  hookName: keyof ULDEPluginHooks;
  intensity: number; // normalized 0–1
}

