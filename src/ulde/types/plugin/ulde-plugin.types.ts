// src/ulde/types/plugin/ulde-plugin.types.ts

import { ULDEPageContext, ULDERenderContext } from "@ulde/types/context";

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
