// src/ulde/configurator/configurator.ts

import { Component } from '@angular/core';
import { UldeViewer } from '@ulde/viewer';

@Component({
  selector: 'ulde-configurator',
  standalone: true,
  imports: [UldeViewer],
  templateUrl: 'ulde-configurator.html'
})
export class ProductConfigurator {
  selectedModelId = 'ULDE-MODEL';
  selectedVariantId = 'default';
  zoom = 1;
  rotation = { x: 0, y: 0, z: 0 };

  onViewerStateChange(state: any) {
    // sync UI or analytics
  }
}
