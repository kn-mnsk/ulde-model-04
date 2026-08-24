// src/ulde/viewer/ulde-renderer.service.ts

import { Injectable, ElementRef } from '@angular/core';
import type { ULDERendererHandle, ULDERendererConfig, ULDERendererEvents, ULDERendererState } from '@ulde/types/renderer';

@Injectable({ providedIn: 'root' })
export class ULDERendererService {
  private handle?: ULDERendererHandle;

  init(
    host: ElementRef<HTMLElement>,
    config: Omit<ULDERendererConfig, 'container'>,
    events?: ULDERendererEvents
  ) {
    this.dispose();

    this.handle = this.createUldeRenderer(
      { container: host.nativeElement, ...config },
      events
    );
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
    events?: ULDERendererEvents
  ): ULDERendererHandle {

    // Internal state for the renderer
    let state: ULDERendererState = {
      modelId: '',
      variantId: undefined,
      zoom: 1,
      rotation: { x: 0, y: 0, z: 0 },
      renderContext: undefined
    };

    // Initial render (optional)
    config.container.innerHTML = '<p>ULDE Viewer READY</p>';

    return {
      setState(partial) {
        // merge new partial state
        state = { ...state, ...partial };

        // If ULDE renderContext exists, render its HTML
        if (state.renderContext) {
          config.container.innerHTML = state.renderContext.html;
        }

        // Emit stateChange event
        events?.onStateChange?.(state);
      },

      getState() {
        return state;
      },

      dispose() {
        config.container.innerHTML = '';
      }
    };
  }

}
