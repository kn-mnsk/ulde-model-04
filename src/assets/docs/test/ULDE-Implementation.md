# ULDE (Unified Lifecycle Desin Engine) Implementation

## 1. Folder Structure

```
src/
  app/
  ...

  ulde/
    configurator/
      index.ts
      ulde-configurator.html
      ulde-configurator.route.ts
      ulde-configurator.ts
    core/
      debug/
        index.ts
        ulde-debug-tools.service.ts
      overlay/
        index.ts
        ulde-overlay.html
        ulde-overlay.scss
        ulde-overlay.service.ts
        ulde-overlay.ts
      index.ts
      ulde-lifecycle.service.ts
      ulde-plugin-registry.service.ts
      ulde-runtime.service.ts
    engine/
      index.ts
      ulde-ast-builder.engine.ts
      ulde-ast-renderer.engine.ts
      ulde-ast-visitor.engine.ts
      ulde-content.engine.service.ts
      ulde-docs.engine.service.ts
      ulde-interactive.engine.service.ts
      ulde-layout.engine.service.ts
    plugins/
      contributor/ // for 
      registry/
        ulde-plugin-registry.ts
      system/
        content/
          index.ts
          ulde-codeblock.plugin.ts
          ulde-frontmatter-normalizer.plugin.ts
        demo/
          index.ts
          ulde-playground-injector.plugin.ts
        interactive/
          index.ts
          ulde-dummy-test.plugin.ts
        layout/
          index.ts
          ulde-toc.plugin.ts
        navigation/
          index.ts
          ulde-navigation-breadcrumbs.plugin.ts
        ulde/
         index.ts
         ulde-overlay-custom-panel.plugin.ts
         ulde-slow-plugin-detector.plugin.ts
         ulde-timeline-profiler.plugin.ts
        index.ts
      index.ts
    tools/
    types/
      context/
        index.ts
        ulde-context.types.ts
      debug/
      index.ts
      ulde-debug.types.ts
      diagnostic/
        index.ts
        ulde-diagnostic.types.ts
      frame/
        index.ts
        ulde-frame.types.ts
      lifecycle/
        index.ts
        ulde-lifecycle.types.ts
      plugin/
        index.ts
        ulde-plugin.types.ts
      timing/
        index.ts
        ulde-timing.types.ts
      index.ts
    viewer/
      index.ts
      ulde-renderer.service.ts
      ulde-viewer.html
      ulde-viewer.scss
      ulde-viewer.ts

...

```

## File contents by the folder structure

## 1. src/ulde/configurator
**1-1. index.ts**
```ts
// src/ulde/configurator/index.ts

export * from "./ulde-configurator";

```
**1-2. ulde-configurator.html**
```ts
// src/ulde/configurator/ulde-configurator.html

<div class="configurator-layout">
  <div class="viewer-pane">
    <ulde-viewer
      [modelId]="selectedModelId"
      [variantId]="selectedVariantId"
      [zoom]="zoom"
      [rotation]="rotation"
      (stateChange)="onViewerStateChange($event)"
    ></ulde-viewer>
  </div>

  <div class="controls-pane">
    <!-- controls for ULDE-MODEL-01 -->
  </div>
</div>

```

**1-3. ulde-configurator.route.ts**
```ts
// src/ulde/configurator/ulde-configurator.routes.ts


import type { Routes } from '@angular/router';
import { ProductConfigurator } from '@ulde/configurator';

export const PRODUCT_CONFIGURATOR_ROUTES: Routes = [
  {
    path: '',
    component: ProductConfigurator
  }
];

```

**1-4. ulde-configurator.ts**
```ts
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

```
