// src/ulde/configurator/configurator.ts

import { Component } from '@angular/core';
import { ULDERendererState } from '@ulde/types/renderer/ulde-renderer.types';
import { UldeViewer } from '@ulde/viewer';

@Component({
  selector: 'ulde-configurator',
  standalone: true,
  imports: [UldeViewer],
  templateUrl: 'ulde-configurator.html'
})
export class ProductConfigurator {

  rendererState = {
    modelId: 'ULDE-MODEL',
    variantId: 'default',
    zoom: 1,
    rotation: { x: 0, y: 0, z: 0 },
    renderContext: undefined,
    currentLifecyclePhase: undefined,
    diagnostics: [],
    frame: undefined,
  };

  onViewerStateChange(state: ULDERendererState) {
    // sync UI or analytics
  }

}
