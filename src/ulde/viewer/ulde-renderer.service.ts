// app/ulde-viewer/ulde-renderer.service.ts

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

  config.container.innerHTML = '<p> ULDE Viewer TEST</p>';
  config.width = 500;
  config.height = 500;
  config.backgroundColor = '#FF5733';

  // implementation in renderer layer (no Angular imports)
  // ...
  return {
    setState(partial) { /* ... */ },
    getState() { /* ... */ return {} as ULDERendererState; },
    dispose() { /* ... */ }
  };
}


}
