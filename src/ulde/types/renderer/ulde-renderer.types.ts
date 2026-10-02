// src/ulde/types/renderer/ulde-renderer.types.ts

import { ULDEExecutionContext } from "@ulde/types/context";
import { ULDEDevtoolsSnapshot } from "@ulde/types/devtools";

export interface ULDERendererConfig {
  container: HTMLElement;
  width: number;
  height: number;
  backgroundColor?: string;
}

export interface ULDERendererState {
  modelId?: string;
  variantId?: string;
  zoom?: number;
  rotation?: { x: number; y: number; z: number };

  // ULDE docs rendering
  executionContext?: ULDEExecutionContext;
  // renderContext?: ULDERenderContext;
  // currentLifecyclePhase?: ULDELifecyclePhase;
  // diagnostics?: ULDEDiagnostic[];
  // frame?: ULDEFrame;

  devtoolsSnapshot?: ULDEDevtoolsSnapshot;
}

export interface ULDERendererEvents {
  onReady?: () => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: ULDERendererState) => void;
}

export interface ULDERendererHandle {
  setState(state: Partial<ULDERendererState>): void;
  getState(): ULDERendererState;
  highlightDiagnostic(message: string): void;
  dispose(): void;
}
