// src/ulde/types/ulde.types.ts

import { SafeHtml } from '@angular/platform-browser';

export type ULDELifecyclePhase =
  | 'init'
  | 'load'
  | 'render'
  | 'hydrate'
  | 'afterRender';


export interface ULDEPlugin {
  pluginPhase: ULDEPluginPhase,
  pluginTitle: string;
  version?: string;
  description?: string;
  enabled?: boolean;
  hooks: ULDEPluginHooks;
}


export interface ULDEPluginHooks {
  onInit?(): void | Promise<void>;
  onPageLoad?(ctx: ULDEPluginContext): void | Promise<void>;
  onBeforeRender?(ctx: ULDEPluginContext): void | Promise<void>;
  onAfterRender?(ctx: ULDEPluginContext): void | Promise<void>;
  onDestroy?(): void | Promise<void>;
}

export interface ULDEPageContext {
  pageId: string;
  route: string;
  frontmatter: Record<string, any>;
  rawContent: string;
}

export type ULDEPluginPhase = "content" | "layout" | "interactive" | "navigation" | "diagnostic" | 'destroy'

export interface ULDEPluginContext {
  lifecyclePhase: ULDELifecyclePhase
  pluginPhase: ULDEPluginPhase,
  pageId?: string;
  rawContent?: string;
  ast?: any;
  htmlStr?: string;
  html?: SafeHtml;
  layout?: string;
}


export interface ULDEPhase {
  lifecyclePhase: ULDELifecyclePhase;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface ULDEPluginTiming {
  pluginTitle: string;
  hookName: string;
  pluginPhase: ULDEPluginPhase;
  duration: number;
}

export interface ULDEFrame {
  id: string;
  timestamp: number;
  phases: ULDEPhase[];
  pluginTimings: ULDEPluginTiming[];
}

export interface ULDEDiagnostic {
  level: 'info' | 'warn' | 'error';
  message: string;
  pluginPhase?: ULDEPluginPhase;
  pluginTitle?: string;
}
