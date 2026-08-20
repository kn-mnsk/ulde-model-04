// product-configurator/product-configurator.ts

/**
 * Only if you need:

lazy loading via routing

a bundle of many components

compatibility with older Angular libraries

You don’t need any of that here.
 */

import { Component } from '@angular/core';
import { UldeViewer } from '@ulde/viewer';

@Component({
  selector: 'ulde-configurator',
  standalone: true,
  imports: [UldeViewer],
  templateUrl: 'ulde-configurator.html'
})
export class ProductConfigurator {
  selectedModelId = 'ULDE-MODEL-04';
  selectedVariantId = 'default';
  zoom = 1;
  rotation = { x: 0, y: 0, z: 0 };

  onViewerStateChange(state: any) {
    // sync UI or analytics
  }
}
