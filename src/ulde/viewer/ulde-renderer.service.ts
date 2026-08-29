// src/ulde/viewer/ulde-renderer.service.ts

import { Injectable, ElementRef } from '@angular/core';
import { ULDEDiagnostic, ULDEFrame, ULDELifecyclePhase } from '@ulde/types';
import type {
  ULDERendererHandle,
  ULDERendererConfig,
  ULDERendererEvents,
  ULDERendererState,
} from '@ulde/types/renderer';

@Injectable({ providedIn: 'root' })
export class ULDERendererService {
  private handle?: ULDERendererHandle;

  init(
    host: ElementRef<HTMLElement>,
    config: Omit<ULDERendererConfig, 'container'>,
    events?: ULDERendererEvents,
  ) {
    this.dispose();

    this.handle = this.createUldeRenderer({ container: host.nativeElement, ...config }, events);
  }

  setState(state: Partial<ULDERendererState>) {
    this.handle?.setState(state);
  }

  getState(): ULDERendererState | null {
    return this.handle ? this.handle.getState() : null;
  }

  dispose() {
    this.handle?.dispose();
    this.handle = undefined;
  }

  private createUldeRenderer(
    config: ULDERendererConfig,
    events?: ULDERendererEvents,
  ): ULDERendererHandle {
    // Internal state for the renderer
    let state: ULDERendererState = {
      modelId: '',
      variantId: '',
      zoom: 1,
      rotation: { x: 0, y: 0, z: 0 },
      renderContext: undefined,
      currentLifecyclePhase: undefined,
      diagnostics: [],
      frame: undefined
    };

    // Initial render (optional)
    config.container.innerHTML = '<p>[ULDERendererService] ULDE Viewer READY</p>';

    return {
      setState(partial) {

        // merge new partial state
        state = { ...state, ...partial };

        console.log(`Log: [ULDERenderService] createUldeRenderer \nPartial<ULDERendererState>=`, state);

        if (partial.currentLifecyclePhase) {
          highlightLifecyclePhase(partial.currentLifecyclePhase);
        }

        if (partial.diagnostics) {
          renderDiagnostics(partial.diagnostics);
        }

        if (partial.frame) {
          renderFrameInfo(partial.frame);
        }

        // if (partial.renderContext) {
        //   console.log(
        //     `Log: [ULDERenderService] createUldeRenderer \nPartial<ULDERendererState>=`,
        //     partial.renderContext,
        //   );

        //   config.container.innerHTML = partial.renderContext.html;
        // }

        // merge new partial state
        // state = { ...state, ...partial };

        // // If ULDE renderContext exists, render its HTML
        // if (state.renderContext) {
          config.container.innerHTML = state.renderContext?.html as string;
        // }

        // Emit stateChange event
        events?.onStateChange?.(state);
      },

      getState() {
        return state;
      },

      dispose() {
        config.container.innerHTML = '';
      },
    };
  }
}

function highlightLifecyclePhase(lifecyclePhase: ULDELifecyclePhase) {
  // e.g., add a small badge or highlight
}

function renderDiagnostics(diags: ULDEDiagnostic[]) {
  // e.g., show a diagnostics panel inside viewer
}

function renderFrameInfo(frame: ULDEFrame) {
  // e.g., show total render time or plugin timings
}
