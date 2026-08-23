// src/ulde/types/renderer/ulde-renderer.types.ts

import { ULDERenderContext } from "@ulde/types/context";

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
  renderContext?: ULDERenderContext;
}

export interface ULDERendererEvents {
  onReady?: () => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: ULDERendererState) => void;
}

export interface ULDERendererHandle {
  setState(state: Partial<ULDERendererState>): void;
  getState(): ULDERendererState;
  dispose(): void;
}
