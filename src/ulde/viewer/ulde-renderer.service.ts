// src/ulde/viewer/ulde-renderer.service.ts
import { Injectable, ElementRef } from '@angular/core';
import {
  ULDERendererConfig, ULDERendererEvents, ULDERendererHandle, ULDERendererState
} from '@ulde/types/renderer';
import { ULDERenderContext, } from '@ulde/types/context';
import { ULDEDiagnostic } from '@ulde/types/diagnostic';
import { ULDEFrame } from '@ulde/types/frame';

@Injectable({ providedIn: 'root' })
export class ULDERendererService {
  private handle: ULDERendererHandle | null = null;

  init(
    host: ElementRef<HTMLElement>,
    size: { width: number; height: number },
    events?: ULDERendererEvents
  ): void {
    const config: ULDERendererConfig = {
      container: host.nativeElement,
      width: size.width,
      height: size.height,
      backgroundColor: '#ffffff'
    };

    this.handle = this.createUldeRenderer(config, events);
    events?.onReady?.();
  }

  setState(partial: Partial<ULDERendererState>): void {
    this.handle?.setState(partial);
  }

  getState(): ULDERendererState | null {
    return this.handle ? this.handle.getState() : null;
  }

  dispose(): void {
    this.handle?.dispose();
    this.handle = null;
  }

  private createUldeRenderer(
    config: ULDERendererConfig,
    events?: ULDERendererEvents
  ): ULDERendererHandle {
    let state: ULDERendererState = {
      modelId: '',
      variantId: undefined,
      zoom: 1,
      rotation: { x: 0, y: 0, z: 0 },
      renderContext: undefined,
      currentLifecyclePhase: undefined,
      diagnostics: [],
      frame: undefined
    };

    config.container.innerHTML = '<p>ULDE Viewer READY</p>';

    function renderFromContext(renderContext: ULDERenderContext | undefined) {
      if (!renderContext) return;
      config.container.innerHTML = renderContext.html;
    }

    function renderDiagnosticsOverlay(diags: ULDEDiagnostic[] | undefined) {
      // optional: could render a small overlay or badge; keep minimal for now
      if (!diags || diags.length === 0) return;
      // no-op in this minimal version; diagnostics are already injected into AST
    }

    function renderLifecyclePhase(phase: string | undefined) {
      // optional: could add a data attribute or small badge
      if (!phase) return;
      config.container.dataset['uldeLifecyclePhase'] = phase;
    }

    function renderFrameInfo(frame: ULDEFrame | undefined) {
      // optional: could add timing info; keep minimal for now
      if (!frame) return;
      config.container.dataset['uldeFrameId'] = frame.id;
    }

    return {
      setState(partial: Partial<ULDERendererState>) {
        state = { ...state, ...partial };

        if (partial.renderContext !== undefined) {
          renderFromContext(state.renderContext);
        }

        if (partial.currentLifecyclePhase !== undefined) {
          renderLifecyclePhase(state.currentLifecyclePhase);
        }

        if (partial.diagnostics !== undefined) {
          renderDiagnosticsOverlay(state.diagnostics);
        }

        if (partial.frame !== undefined) {
          renderFrameInfo(state.frame);
        }

        events?.onStateChange?.(state);
      },

      getState() {
        return state;
      },

      dispose() {
        config.container.innerHTML = '';
        delete config.container.dataset['uldeLifecyclePhase'];
        delete config.container.dataset['uldeFrameId'];
      }
    };
  }
}
