# ULDE (Unified Lifecycle Desin Engine) Implementation

## 1. Folder Structure

```
src/
  app/
    demo/
      ulde-demo-01/
        ulde-demo-01.html
        ulde-demo-01.scss
        ulde-demo-01.spec.ts
        ulde-demo-01.ts
    ...
    app.html
    app.routes.ts
    app.scss
    app.spec.ts
    app.ts
  ...
  ulde/
    configurator/
      index.ts
      ulde-configurator.html
      ulde-configurator.routes.ts
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
      ulde-interactive.engine.service.ts
      ulde-layout.engine.service.
      ulde-render-context-builder.engine.service.ts
    plugins/
      contributor/ // for the future
      registry/
        index.ts
        ulde-plugin-registry.ts
      system/
        content/
          index.ts
          ulde-codeblock.plugin.ts
          ulde-frontmatter-normalizer.plugin.ts
        demo/
          index.ts
          ulde-demo.plugin.ts
          ulde-playground-injector.plugin.ts
        interactive/
          index.ts
          ulde-dummy-test.plugin.ts
        layout/
          index.ts
          ulde-anchor.plugin.ts
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
    tools/  // for the future
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
      renderer/
        index.ts
        ulde-renderer.types.ts
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
...

```

## 2. File contents by the folder structure

### 1. app/

#### 1-1. demo/ulde-demo-01/ulde-demo-01.html
```html
<!-- src/app/demo/ulde-demo-01/ulde-demo-01.html
  -->
<!-- <p>ulde-demo-01 works!</p> -->
<ulde-viewer class="ulde-viewer-host" #HostUldeViewerRef [$rendererState]="$rendererState()" (stateChange)="onViewerStateChange($event)" (error)="onError($event)">
</ulde-viewer>
```

#### 1-2. demo/ulde-demo-01/ulde-demo-01.scss
```scss
// src/app/demo/ulde-demo-01/ulde-demo-01.scss

.ulde-viewer-host {
  // width: 80%;
  // height: 100vh;
  position: relative;
  overflow-y: hidden;
}

```

#### 1-3. demo/ulde-demo-01/ulde-demo-01.ts
```ts
// src/app/demo/ulde-demo-01/ulde-demo-01.ts

import { Component, signal, AfterViewInit, OnInit, ViewChild, ElementRef } from '@angular/core';

import { ULDEPageContext, ULDERenderContext } from '@ulde/types/context';
import { ULDELifecycleService } from '@ulde/core';

import { UldeViewer } from '@ulde/viewer';
import { ULDERendererState } from '@ulde/types/renderer/ulde-renderer.types';
import { isBrowser } from '../../global.utils/global.utils';
import { ContentEngineService } from '@ulde/engine';



@Component({
  selector: 'app-ulde-demo-01',
  imports: [UldeViewer],
  templateUrl: './ulde-demo-01.html',
  styleUrl: './ulde-demo-01.scss',
})
export class UldeDemo01 implements AfterViewInit, OnInit {

  component = 'UldeDemo01';

  renderContext: ULDERenderContext | undefined = undefined;

  $pageId = signal<string>('docs/index'); // initila value

  $rendererState = signal<ULDERendererState>({
    modelId: 'ulde-demo-01',
    variantId: 'default',
    zoom: 1,
    rotation: { x: 0, y: 0, z: 0 },
    renderContext: undefined,
    currentLifecyclePhase: undefined,
    diagnostics: undefined,
    frame: undefined,
  });

  // private md = new MarkdownIt();

  private async buildDemoPageContext(): Promise<ULDEPageContext | void> {

    // load markdown file
    const markdown = await this.contenEngine.load(this.$pageId());
    if (!markdown) return;

    const tokens = await this.contenEngine.transform(markdown);
    // const tokens = this.md.parse(markdown, {});

    return {
      pageId: this.$pageId(),
      raw: markdown,
      token: tokens,
      meta: {},
    };
  }

  private async runUldeDemo(lifecycle: ULDELifecycleService) {
    const pageContext = await this.buildDemoPageContext();
    if (!pageContext) return undefined;
    const renderContext = await lifecycle.executeLifecycle(pageContext);

    return renderContext;
  }


  @ViewChild('hostUldeViewerRef', { static: true }) hostUldeViewerRef!: ElementRef<HTMLElement>;
  constructor(
    private contenEngine: ContentEngineService,
    private lifecycle: ULDELifecycleService) { }

  async ngOnInit() {
    // this.renderContext = await this.runUldeDemo(this.lifecycle);
  }

  async ngAfterViewInit() {
    if (!isBrowser()) return;

    const renderContext = await this.runUldeDemo(this.lifecycle);
    if (!renderContext) {
      console.error('Error: [UldeDemo01] Render context is not available.');
      return;
    }

    this.$rendererState.update(state => ({ ...state, renderContext }));

    console.log(`Log: [${this.component}] ngAfterViewInit\n rendererState:`, this.$rendererState());

  }

  onViewerStateChange(state: ULDERendererState) {

    console.log(`Log: [${this.component}] onViewerStateChanged state=`, state);
    // sync UI or analytics
  }

  onError(error: Error) {
    console.error(`Log: [${this.component}] onError error=`, JSON.stringify(error, null, 2));

  }

}

```

#### 1-4. app.html
```ts
<!-- src/app/app.html -->
 
<p>App Works!</p>
<!-- <ulde-configurator></ulde-configurator> -->
<app-ulde-demo-01></app-ulde-demo-01>

```

#### 1-5. app.routes.ts
```ts
// src/app/app.routes.ts

import type { Routes } from '@angular/router';;
// import { PageNotFound } from './page-not-found/page-not-found';
// import { Error } from './page-error/error';


export const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'configure',
  //   pathMatch: 'full'
  // },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  // {
  //   path: 'configure',
  //   loadChildren: () =>
  //     import('./product-configurator/product-configurator.routes')
  //       .then(m => m.PRODUCT_CONFIGURATOR_ROUTES)
  // },

  {
    path: 'home',
    loadComponent: () =>
      import('./app')
        .then(m => m.App)
  },

  // {
  //   path: 'docs',
  //   loadChildren: () =>
  //     import('./docs-viewer/docs-viewer.routes')
  //       .then(m => m.DOCS_VIEWER_ROUTES)
  // },

  {
    path: 'viewer-demo',
    loadComponent: () =>
      import('../ulde/viewer/ulde-viewer')
        .then(m => m.UldeViewer)
  },
  {
    path: 'PageNotFound',
    loadComponent: () => import('./page-not-found/page-not-found').then(m => m.PageNotFound)
  },

  {
    path: '**',
    redirectTo: 'PageNotFound'
  }
];

// export const routes: Routes = [
// {
//     path: 'home',
//     title: 'home-UldeModel-v1',
//     loadComponent:  () => import('./app').then(m => m.App)
//   },
//   {
//     path: "fallback",
//     title: "Page Not Found",
//     component: PageNotFound
//   },
//   {
//     path: 'error',
//     title: 'Error on Page',
//     component: Error
//   },
//     {
//     path: '',
//     redirectTo: "home",
//     pathMatch: 'full'
//   },
//   {
//     path: '**',
//     redirectTo: "fallback"
//   }
// ];

```

#### 1-6. app.scss

None


#### 1-7. app.ts
```ts
// src/app/app.ts

import { Component, signal } from '@angular/core';
// import { DocsViewer } from './docs-viewer/docs-viewer';
import { ProductConfigurator } from '../ulde/configurator/ulde-configurator';
import { UldeDemo01 } from './demo/ulde-demo-01/ulde-demo-01';

@Component({
  selector: 'app-root',
  imports: [UldeDemo01],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('App');

}

```


### 2. src/ulde/configurator/

#### 2-1. index.ts
```ts
// src/ulde/configurator/index.ts

export * from "./ulde-configurator";

```

#### 2-2. ulde-configurator.html
```ts
// src/ulde/configurator/ulde-configurator.html

<div class="configurator-layout">
  <div class="viewer-pane">
    <ulde-viewer
      [$rendererState]="rendererState"
      (stateChange)="onViewerStateChange($event)"
    ></ulde-viewer>
  </div>

  <div class="controls-pane">
    <!-- controls for ULDE-MODEL-01 -->
  </div>
</div>

```

#### 2-3. ulde-configurator.routes.ts
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

#### 2-4. ulde-configurator.ts
```ts
/// src/ulde/configurator/configurator.ts

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

```

### 3. src/ulde/core/

#### 3-1. debug/

##### 3-1-1. index.ts
```ts
// src/ulde/core/debug/index.ts

export * from "./ulde-debug-tools.service";

```

##### 3-1-2. ulde-debug.tools.service.ts
```ts
// src/ulde/core/debug/ulde-debug.tools.service.ts

import { Injectable } from '@angular/core';
import { ULDEOverlayService } from '@ulde/core';
import { ULDEHeatmapCell, ULDETimelinePoint } from '@ulde/types/debug';

@Injectable({ providedIn: 'root' })
export class ULDEDebugToolsService {
  constructor(private overlay: ULDEOverlayService) { }

  /**
   * Build a timeline of frames with total durations.
   */
  buildTimeline(): ULDETimelinePoint[] {
    return this.overlay.frames().map(frame => {
      const total = frame.lifecyclePhaseTimings.reduce((sum, p) => sum + p.duration, 0);

      return {
        frameId: frame.id,
        totalDuration: total,
        phases: frame.lifecyclePhaseTimings.map(p => ({
          lifecyclePhase: p.lifecyclePhase,
          duration: p.duration
        }))
      };
    });
  }

  /**
   * Generate a heatmap of plugin performance.
   * Normalizes plugin durations across all frames.
   */
  buildHeatmap(): ULDEHeatmapCell[] {
    const frames = this.overlay.frames();
    const timings = frames.flatMap(f => f.pluginTimings);

    if (!timings.length) return [];

    const max = Math.max(...timings.map(t => t.duration));

    return timings.map(t => ({
      pluginKind: t.pluginKind,
      pluginName: t.pluginName,
      hookName: t.hookName,
      intensity: t.duration / max // normalized 0–1
    }));
  }

  /**
   * Generate warnings based on patterns in frame history.
   */
  generateWarnings() {
    const frames = this.overlay.frames();
    if (frames.length < 3) return;

    const lastThree = frames.slice(-3);
    const durations = lastThree.map(f =>
      f.lifecyclePhaseTimings.reduce((sum, p) => sum + p.duration, 0)
    );

    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const last = durations[durations.length - 1];

    // Sudden spike detection
    if (last > avg * 1.5) {
      this.overlay.addDiagnostic({
        level: 'warn',
        message: `Frame duration spike detected: ${last.toFixed(1)}ms (avg ${avg.toFixed(1)}ms)`
      });
    }

    // Consistent slowdown detection
    if (durations.every(d => d > avg)) {
      this.overlay.addDiagnostic({
        level: 'warn',
        message: `Consistent slowdown across last 3 frames`
      });
    }
  }
}

```

#### 3-2. overay/

##### 3-2-1. index.ts
```ts
// src/ulde/core/overlay/index.ts

export * from "./ulde-overlay.service";
export * from "./ulde-overlay";

```

##### 3-2-2. ulde-overlay.html
```html
<!-- src/ulde/core/overlay/ulde-overlay.html -->
<!-- src/ulde/core/overlay/ulde-overlay.html -->
 
<p>UldeOverlay Works!</p>
<div class="ulde-overlay" [class.hidden]="!visible()" [style.opacity]="opacity()">

  <!-- Header -->
  <header class="overlay-header">
    <h3>ULDE Overlay</h3>

    <div class="controls">
      <button (click)="toggleOverlay()">Toggle</button>
      <button (click)="pinOverlay()">
        {{ pinned() ? 'Unpin' : 'Pin' }}
      </button>

      <input type="range" min="0.2" max="1" step="0.1" [value]="opacity()"
        (input)="setOverlayOpacity($any($event.target).value)" />
    </div>
  </header>

  <!-- Lifecycle Phases Timeline -->
  <section class="phase-timeline">
    @for (p of lifecyclePhaseTimings(); track p.lifecyclePhase) {
    <div class="phase" [class.warn]="p.duration > thresholds.phaseWarn"
      [class.error]="p.duration > thresholds.phaseError" (click)="selectPhase(p)">
      <span class="label">{{ p.lifecyclePhase }}</span>
      <span class="duration">{{ p.duration | number:'1.0-1' }}ms</span>
    </div>
    }
  </section>

  <!-- Plugin Timings -->
  <section class="plugin-timings">
    <h4>Plugin Timings</h4>

    @for (t of filteredPluginTimings(); track t.pluginName) {
    <div class="plugin-row">
      <span class="plugin">{{ t.pluginName }}</span>
      <span class="kind">{{ t.pluginKind }}</span>
      <span class="hook">{{ t.hookName }}</span>
      <span class="phase">{{ t.lifecyclePhase }}</span>
      <span class="duration">{{ t.duration | number:'1.0-1' }}ms</span>
    </div>
    }
  </section>

  <!-- Sparkline -->
  <section class="sparkline">
    <svg width="100%" height="40">
      <polyline class="sparkline-line" [attr.points]="sparklinePoints()"></polyline>
    </svg>
  </section>

  <!-- Diagnostics -->
  <section class="diagnostics">
    <h4>Diagnostics</h4>

    @for (d of diagnostics(); track d.message) {
    <div class="diag-row">
      <span class="level" [class.warn]="d.level === 'warn'" [class.error]="d.level === 'error'">
        {{ d.level }}
      </span>

      <span class="message">{{ d.message }}</span>

      @if (d.lifecyclePhase) {
      <span class="meta">(phase: {{ d.lifecyclePhase }})</span>
      }

      @if (d.pluginName) {
      <span class="meta">(plugin: {{ d.pluginName }})</span>
      }
    </div>
    }
  </section>

  <!-- Frame History -->
  <section class="frame-history">
    <h4>Frames</h4>

    @for (f of frameHistory(); track f.id) {
    <div class="frame-row" (click)="selectFrame(f)">
      <span class="frame-id">{{ f.id }}</span>
      <span class="timestamp">{{ f.timestamp | date:'mediumTime' }}</span>
      <span class="total">
        {{
        f.lifecyclePhaseTimings.reduce((a, p) => a + p.duration, 0)
        | number:'1.0-1'
        }}ms
      </span>
    </div>
    }
  </section>

</div>


```

##### 3-2-3. ulde-overaly.scss
```scss
// src/ulde/core/overlay/ulde-overlay.scss

.ulde-overlay {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 420px;
  height: 65vh;
  background: rgba(20, 20, 20, 0.85);
  color: #eee;
  font-family: system-ui, sans-serif;
  border-radius: 8px 8px 0 0;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  transition: opacity 0.2s ease;

  &.hidden {
    opacity: 0;
    pointer-events: none;
  }

  header.overlay-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .controls {
      display: flex;
      gap: 8px;
      align-items: center;

      button {
        background: #555;
        border: none;
        padding: 6px 10px;
        border-radius: 4px;
        color: #eee;
        cursor: pointer;

        &:hover {
          background: #666;
        }
      }

      input[type='range'] {
        width: 80px;
      }
    }
  }

  /* Phase Timeline */
  .phase-timeline {
    display: flex;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 12px;

    .phase {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 4px;
      background: #333;
      border-right: 1px solid #444;
      cursor: pointer;
      transition: background 0.2s;

      &.warn {
        background: #7a5f00;
      }

      &.error {
        background: #7a0000;
      }

      .label {
        font-size: 10px;
        text-transform: uppercase;
        opacity: 0.8;
      }

      .duration {
        font-size: 11px;
        font-weight: bold;
      }
    }
  }

  /* Plugin Timings */
  .plugin-timings {
    max-height: 140px;
    overflow-y: auto;
    margin-bottom: 12px;

    h4 {
      margin: 0 0 6px 0;
      font-size: 14px;
      font-weight: 600;
    }

    .plugin-row {
      display: grid;
      grid-template-columns: 1fr 0.7fr 0.7fr 0.7fr 0.5fr;
      padding: 4px 0;
      border-bottom: 1px solid #444;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .plugin {
        font-weight: bold;
      }

      .duration {
        text-align: right;
      }
    }
  }

  /* Sparkline */
  .sparkline {
    height: 40px;
    margin-bottom: 12px;

    .sparkline-line {
      fill: none;
      stroke: #4fc3f7;
      stroke-width: 2;
    }
  }

  /* Diagnostics */
  .diagnostics {
    max-height: 120px;
    overflow-y: auto;
    margin-bottom: 12px;

    h4 {
      margin: 0 0 6px 0;
      font-size: 14px;
      font-weight: 600;
    }

    .diag-row {
      display: flex;
      gap: 8px;
      padding: 4px 0;
      border-bottom: 1px solid #444;

      .level {
        font-weight: bold;
        text-transform: uppercase;

        &.warn {
          color: #ffb300;
        }

        &.error {
          color: #ff5252;
        }
      }

      .meta {
        opacity: 0.7;
        font-size: 11px;
      }
    }
  }

  /* Frame History */
  .frame-history {
    max-height: 120px;
    overflow-y: auto;

    h4 {
      margin: 0 0 6px 0;
      font-size: 14px;
      font-weight: 600;
    }

    .frame-row {
      display: grid;
      grid-template-columns: 1fr 1fr 0.7fr;
      padding: 4px 0;
      border-bottom: 1px solid #444;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .frame-id {
        font-weight: bold;
      }

      .total {
        text-align: right;
      }
    }
  }
}

```

##### 3-2-4. ulde-overlay.service.ts
```ts
// src/ulde/core/overlay/ulde-overlay.service.ts

import { computed, Injectable, signal } from '@angular/core';
import { ULDEDiagnostic } from '@ulde/types/diagnostic';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDELifecyclePhase, ULDELifecyclePhaseTiming } from '@ulde/types/lifecycle';
import { ULDEPluginTiming } from '@ulde/types/timing';

@Injectable({ providedIn: 'root' })
export class ULDEOverlayService {
  // Overlay visibility + controls
  visible = signal(true);
  pinned = signal(false);
  opacity = signal(1);

  // Lifecycle state
  lifecyclePhaseTimings = signal<ULDELifecyclePhaseTiming[]>([]);
  currentLifecyclePhaseTiming = signal<ULDELifecyclePhaseTiming | null>(null);

  // Plugin timings
  pluginTimings = signal<ULDEPluginTiming[]>([]);

  // Frame history
  frames = signal<ULDEFrame[]>([]);
  currentFrame = signal<ULDEFrame | null>(null);

  // Diagnostics
  diagnostics = signal<ULDEDiagnostic[]>([]);

  // Thresholds (tweakable)
  thresholds = {
    phaseWarn: 8,
    phaseError: 16,
  };

  // Derived: sparkline points
  sparklinePoints = computed(() => {
    const history = this.frames();
    if (!history.length) return '';

    return history
      .map((f, i) => {
        const total = f.lifecyclePhaseTimings.reduce((a, p) => a + p.duration, 0);
        return `${i * 10},${40 - Math.min(total, 40)}`;
      })
      .join(' ');
  });

  // Derived: filtered plugin timings by lifecycle phase
  filteredPluginTimings = computed(() => {
    const lifecyclePhaseTiming = this.currentLifecyclePhaseTiming();
    const timings = this.pluginTimings();

    if (!lifecyclePhaseTiming) return timings;
    return timings.filter(t => t.lifecyclePhase === lifecyclePhaseTiming.lifecyclePhase);
  });

  // Overlay control methods
  toggle() {
    this.visible.update(v => !v);
  }

  pin() {
    this.pinned.update(p => !p);
  }

  setOpacity(value: number) {
    this.opacity.set(value);
  }

  // Lifecycle event handlers
  startPhase(lifecyclePhase: ULDELifecyclePhase) {
    this.currentLifecyclePhaseTiming.set({
      lifecyclePhase,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
    });
  }

  endPhase(lifecyclePhase: ULDELifecyclePhase) {
    const phase = this.currentLifecyclePhaseTiming();
    if (!phase || phase.lifecyclePhase !== lifecyclePhase) return;

    const end = performance.now();
    const duration = end - phase.startTime;

    const updatedPhase: ULDELifecyclePhaseTiming = {
      ...phase,
      endTime: end,
      duration,
    };

    this.lifecyclePhaseTimings.update(list => [...list, updatedPhase]);
    this.currentLifecyclePhaseTiming.set(null);
  }

  // Plugin timing recording
  recordPluginTiming(timing: ULDEPluginTiming) {
    this.pluginTimings.update(list => [...list, timing]);
  }

  // Frame finalization
  finalizeFrame() {
    const frame: ULDEFrame = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      lifecyclePhaseTimings: this.lifecyclePhaseTimings(),
      pluginTimings: this.pluginTimings(),
      diagnostics: this.diagnostics()
    };

    this.frames.update(list => [...list.slice(-50), frame]); // keep last 50 frames
    this.currentFrame.set(frame);

    // reset for next frame
    this.lifecyclePhaseTimings.set([]);
    this.pluginTimings.set([]);
  }

  // Diagnostics
  addDiagnostic(diag: ULDEDiagnostic) {
    this.diagnostics.update(list => [...list, diag]);
  }


}

```

##### 3-2-5. ulde-overlay.ts
```ts
// src/ulde/core/overlay/ulde-overlay.ts

import { ChangeDetectionStrategy, Component} from '@angular/core';
import {DecimalPipe, DatePipe} from '@angular/common'
import { ULDEOverlayService } from '@ulde/core/overlay';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDELifecyclePhaseTiming } from '@ulde/types/lifecycle';

@Component({
  selector: 'ulde-overlay',
  imports: [DecimalPipe, DatePipe],
  templateUrl: './ulde-overlay.html',
  styleUrls: ['./ulde-overlay.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ULDEOverlay {
  // Declare fields (uninitialized)
  lifecyclePhaseTimings!: typeof this.store.lifecyclePhaseTimings;
  pluginTimings!: typeof this.store.pluginTimings;
  frameHistory!: typeof this.store.frames;
  diagnostics!: typeof this.store.diagnostics;

  currentLifecyclePhaseTiming!: typeof this.store.currentLifecyclePhaseTiming;
  currentFrame!: typeof this.store.currentFrame;

  sparklinePoints!: typeof this.store.sparklinePoints;
  filteredPluginTimings!: typeof this.store.filteredPluginTimings;

  visible!: typeof this.store.visible;
  pinned!: typeof this.store.pinned;
  opacity!: typeof this.store.opacity;

  thresholds!: typeof this.store.thresholds;

  constructor(private store: ULDEOverlayService) {
    // Assign AFTER DI is ready
    this.lifecyclePhaseTimings = store.lifecyclePhaseTimings;
    this.pluginTimings = store.pluginTimings;
    this.frameHistory = store.frames;
    this.diagnostics = store.diagnostics;

    this.currentLifecyclePhaseTiming = store.currentLifecyclePhaseTiming;
    this.currentFrame = store.currentFrame;

    this.sparklinePoints = store.sparklinePoints;
    this.filteredPluginTimings = store.filteredPluginTimings;

    this.visible = store.visible;
    this.pinned = store.pinned;
    this.opacity = store.opacity;

    this.thresholds = store.thresholds;

  }

  // UI actions
  toggleOverlay() {
    this.store.toggle();
  }

  pinOverlay() {
    this.store.pin();
  }

  setOverlayOpacity(value: number) {
    this.store.setOpacity(value);
  }

  // Phase selection (for filtering plugin timings)
  selectPhase(phase: ULDELifecyclePhaseTiming) {
    this.store.currentLifecyclePhaseTiming.set(phase);
  }

  clearPhaseSelection() {
    this.store.currentLifecyclePhaseTiming.set(null);
  }

  // Frame selection (for timeline/sparkline)
  selectFrame(frame: ULDEFrame) {
    this.store.currentFrame.set(frame);
  }
}

```

#### 3-3. index.ts
```ts
// src/ulde/core/index.ts

export * from "./debug/index";
export * from "./overlay/index";
export * from "./ulde-lifecycle.service";
export * from "./ulde-plugin-registry.service";
export * from "./ulde-runtime.service";

```

#### 3-4. ulde-lifecycle.service.ts
```ts
// src/ulde/core/ulde-lifecycle.service.ts

import { Injectable } from '@angular/core';
import { ULDEPluginRegistryService, ULDERuntimeService } from '@ulde/core';
import { ULDEOverlayService } from '@ulde/core/overlay';
import { ULDEPageContext, ULDERenderContext, } from '@ulde/types/context';
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';

import { renderUldeAstToHtml, ULDERenderContextBuilderService } from '@ulde/engine';

@Injectable({ providedIn: 'root' })
export class ULDELifecycleService {

constructor(
  private overlay: ULDEOverlayService,
  private pluginRegistry: ULDEPluginRegistryService,
  private runtime: ULDERuntimeService,
  private renderContextBuilder: ULDERenderContextBuilderService,
) {}

  startLifecyclePhase(lifecyclePhase: ULDELifecyclePhase) {
    this.overlay.startPhase(lifecyclePhase);
  }

  endLifecyclePhase(lifecyclePhase: ULDELifecyclePhase) {
    this.overlay.endPhase(lifecyclePhase);
  }

  async runPluginByLifecyclePhase(
    lifecyclePhase: ULDELifecyclePhase,
    hookName?: keyof ULDEPluginRegistryService['hookMap'],
    ctx?: ULDEPageContext | ULDERenderContext | Record<string, any>,
  ) {
    try {
      this.startLifecyclePhase(lifecyclePhase);

      if (hookName) {
        await this.pluginRegistry.run(hookName, {
          ...(ctx || {}),
          lifecyclePhase,
        });
      }

      this.endLifecyclePhase(lifecyclePhase);
    } catch (err) {
      this.overlay.addDiagnostic({
        level: 'error',
        message: `Error in phase "${lifecyclePhase}": ${String(err)}`,
        lifecyclePhase,
      });
    }
  }

  /**
   * Full lifecycle execution for a page.
   */
  async executeLifecycle(pageContext: ULDEPageContext): Promise<ULDERenderContext> {
    // INIT
    await this.runPluginByLifecyclePhase('init', 'onInit');

    // LOAD
    await this.runPluginByLifecyclePhase('load', 'onPageLoad', pageContext);

    // RENDER
    const renderContext = await this.renderContextBuilder.build(pageContext);
    await this.runPluginByLifecyclePhase('render', 'onBeforeRender', renderContext);

    const ast = renderContext.ast;
    const html = renderUldeAstToHtml(ast);
    renderContext.html = html;

    // HYDRATE
    await this.runPluginByLifecyclePhase('hydrate', 'onAfterRender', renderContext);

    // AFTER RENDER
    this.startLifecyclePhase('afterRender');

    this.pluginRegistry.destroyAll();

    this.runtime.finalizeFrameAndAnalyze();
    this.endLifecyclePhase('afterRender');

    return renderContext;
  }
}

```

#### 3-5. ulde-plugin-registry.service.ts
```ts
// src/ulde/core/ulde-plugin-registry.service.ts

import { Injectable } from '@angular/core';
import { ULDEOverlayService } from '@ulde/core';
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';
import { ULDEPlugin, ULDEPluginHooks, ULDEPluginKind } from '@ulde/types/plugin';
import { ULDEPluginTiming } from '@ulde/types/timing';

import { createUldeStringPluginRegistry } from '@ulde/plugins/registry';

@Injectable({ providedIn: 'root' })
export class ULDEPluginRegistryService {

  private plugins: ULDEPlugin[] = [];

  /**
   * Hook map for lifecycle service convenience.
   */
  hookMap: { [K in keyof ULDEPluginHooks]: K } = {
    onInit: 'onInit',
    onPageLoad: 'onPageLoad',
    onBeforeRender: 'onBeforeRender',
    onAfterRender: 'onAfterRender',
    onDestroy: 'onDestroy',
  };

  constructor(private overlay: ULDEOverlayService) {

    // plugins registry
    const plugins = createUldeStringPluginRegistry();
    plugins.forEach(p => {
      this.register(p);
    })
  }

  /**
   * Register a plugin.
   */
  register(plugin: ULDEPlugin) {
    if (plugin.enabled === false) return;

    this.plugins.push(plugin);
    // this.plugins.sort((a, b) => a.pluginKind.localeCompare(b.pluginKind)); // deterministic order
  }

  /**
   * Run a specific hook across all plugins.
   */
  async run(
    hookName: keyof ULDEPluginHooks,
    ctx?: { lifecyclePhase?: ULDELifecyclePhase } & Record<string, any>,
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const hook = plugin.hooks[hookName];
      if (!hook) continue;

      const start = performance.now();

      try {
        await hook(ctx as any);
      } catch (err) {
        this.overlay.addDiagnostic({
          level: 'error',
          message: `Plugin "${plugin.pluginName}" failed in hook "${hookName}": ${String(err)}`,
          pluginName: plugin.pluginKind,
          lifecyclePhase: ctx?.lifecyclePhase,
        });
      }

      const end = performance.now();

      const timing: ULDEPluginTiming = {
        pluginName: plugin.pluginName,
        pluginKind: plugin.pluginKind,
        hookName,
        lifecyclePhase: ctx?.lifecyclePhase ?? 'init',
        duration: end - start,
      };

      this.overlay.recordPluginTiming(timing);
    }
  }

  /**
   * Destroy all plugins (called on app teardown).
   */
  async destroyAll() {
    for (const plugin of this.plugins) {
      const hook = plugin.hooks.onDestroy;
      if (!hook) continue;

      const start = performance.now();

      try {
        await hook();
      } catch (err) {
        this.overlay.addDiagnostic({
          level: 'error',
          message: `Plugin "${plugin.pluginName}" failed in onDestroy: ${String(err)}`,
          pluginName: plugin.pluginKind,
        });
      }

      const end = performance.now();

      this.overlay.recordPluginTiming({
        pluginName: plugin.pluginName,
        pluginKind: plugin.pluginKind,
        hookName: 'onDestroy',
        lifecyclePhase: 'afterRender',
        duration: end - start,
      });
    }

    this.plugins = [];

  }

  /**
   * Get all registered plugins.
   */
  list() {
    return [...this.plugins];
  }
}

```

#### 3-6. ulde-runtime.service.ts
```ts
// src/ulde/core/ulde-runtime.service.ts

import { Injectable } from '@angular/core';
import {ULDEOverlayService } from '@ulde/core';
import { ULDEFrame } from '@ulde/types/frame';


@Injectable({ providedIn: 'root' })
export class ULDERuntimeService {
  // Simple thresholds (tune as needed)
  private phaseWarnThreshold = 12;   // ms
  private phaseErrorThreshold = 24;  // ms
  private pluginWarnThreshold = 8;   // ms
  private pluginErrorThreshold = 16; // ms

  constructor(
    private overlay: ULDEOverlayService,

  ) { }

  /**
   * Called at the end of each full lifecycle (afterRender).
   * Orchestrates frame finalization + anomaly detection.
   */
  finalizeFrameAndAnalyze() {
    this.overlay.finalizeFrame();

    const frame = this.overlay.currentFrame();
    if (!frame) return;

    this.detectPhaseAnomalies(frame);
    this.detectPluginAnomalies(frame);
  }

  private detectPhaseAnomalies(frame: ULDEFrame) {
    for (const phase of frame.lifecyclePhaseTimings) {
      if (phase.duration > this.phaseErrorThreshold) {
        this.overlay.addDiagnostic({
          level: 'error',
          message: `Lifecycle phase "${phase.lifecyclePhase}" exceeded error threshold (${this.phaseErrorThreshold}ms): ${phase.duration.toFixed(1)}ms`,
          lifecyclePhase: phase.lifecyclePhase,
        });
      } else if (phase.duration > this.phaseWarnThreshold) {
        this.overlay.addDiagnostic({
          level: 'warn',
          message: `Lifecycle phase "${phase.lifecyclePhase}" exceeded warn threshold (${this.phaseWarnThreshold}ms): ${phase.duration.toFixed(1)}ms`,
          lifecyclePhase: phase.lifecyclePhase,
        });
      }
    }
  }

  private detectPluginAnomalies(frame: ULDEFrame) {
    for (const t of frame.pluginTimings) {
      if (t.duration > this.pluginErrorThreshold) {
        this.overlay.addDiagnostic({
          level: 'error',
          message: `Plugin "${t.pluginName}" in hook "${t.hookName}" exceeded error threshold (${this.pluginErrorThreshold}ms): ${t.duration.toFixed(1)}ms`,
          pluginName: t.pluginName,
          lifecyclePhase: t.lifecyclePhase,
        });
      } else if (t.duration > this.pluginWarnThreshold) {
        this.overlay.addDiagnostic({
          level: 'warn',
          message: `Plugin "${t.pluginName}" in hook "${t.hookName}" exceeded warn threshold (${this.pluginWarnThreshold}ms): ${t.duration.toFixed(1)}ms`,
          pluginName: t.pluginName,
          lifecyclePhase: t.lifecyclePhase,
        });
      }
    }
  }

  // in ULDERuntimeService
  // async runForPage(pageCtx: ULDEPageContext, renderCtx: ULDERenderContext) {
  //   await this.lifecycle.run(pageCtx, renderCtx);
  //   this.finalizeFrameAndAnalyze();
  // }

}

```

### 4. src/ulde/engine/

#### 4-1. index.ts
```ts
// src/ulde/engine/index.ts

export * from "./ulde-ast-builder.engine";
export * from "./ulde-ast-renderer.engine";
export * from "./ulde-ast-visitor.engine";
export * from "./ulde-content.engine.service";
export * from "./ulde-interactive.engine.service";
export * from "./ulde-layout.engine.service";
export * from "./ulde-render-context-builder.engine.service";

```

#### 4-2. ulde-ast-builder.engine.ts
```ts
// src/ulde/engine/ulde-ast-builder.engine.ts

import Token from 'markdown-it/lib/token.mjs';
import { ULDEAstNode } from '@ulde/types/context';

export function buildUldeAst(tokens: Token[]): ULDEAstNode[] {
  const root: ULDEAstNode[] = [];
  const stack: ULDEAstNode[][] = [root];

  const push = (node: ULDEAstNode) => {
    stack[stack.length - 1].push(node);
  };

  const open = (node: ULDEAstNode) => {
    push(node);
    stack.push(node.children = []);
  };

  const close = () => {
    stack.pop();
  };

  for (const t of tokens) {
    switch (t.type) {

      // Headings
      case 'heading_open':
        open({
          type: 'heading',
          depth: Number(t.tag.substring(1)),
        });
        break;

      case 'heading_close':
        close();
        break;

      // Paragraphs
      case 'paragraph_open':
        open({ type: 'paragraph' });
        break;

      case 'paragraph_close':
        close();
        break;

      // Lists
      case 'bullet_list_open':
        open({ type: 'list', meta: { ordered: false } });
        break;

      case 'ordered_list_open':
        open({ type: 'list', meta: { ordered: true } });
        break;

      case 'bullet_list_close':
      case 'ordered_list_close':
        close();
        break;

      case 'list_item_open':
        open({ type: 'listItem' });
        break;

      case 'list_item_close':
        close();
        break;

      // Blockquote
      case 'blockquote_open':
        open({ type: 'blockquote' });
        break;

      case 'blockquote_close':
        close();
        break;

      // Thematic break (horizontal rule)
      case 'hr':
        push({ type: 'thematicBreak' });
        break;

      // Images
      case 'image':
        push({
          type: 'image',
          meta: {
            src: t.attrGet('src') || '',
            alt: t.attrGet('alt') || undefined,
            title: t.attrGet('title') || undefined,
          },
        });
        break;

      // Tables
      case 'table_open':
        open({ type: 'table' });
        break;

      case 'table_close':
        close();
        break;

      case 'thead_open':
      case 'tbody_open':
        // treat as section-like containers if needed
        open({ type: 'section', meta: { id: t.type } });
        break;

      case 'thead_close':
      case 'tbody_close':
        close();
        break;

      case 'tr_open':
        open({ type: 'tableRow' });
        break;

      case 'tr_close':
        close();
        break;

      case 'th_open':
      case 'td_open':
        open({ type: 'tableCell' });
        break;

      case 'th_close':
      case 'td_close':
        close();
        break;

      // Code blocks (fence)
      case 'fence':
        push({
          type: 'code',
          lang: t.info || undefined,
          value: t.content,
        });
        break;

      // Inline tokens
      case 'inline':
        for (const child of t.children || []) {
          switch (child.type) {

            case 'text':
              push({ type: 'text', value: child.content });
              break;

            case 'strong_open':
              open({ type: 'strong' });
              break;

            case 'strong_close':
              close();
              break;

            case 'em_open':
              open({ type: 'emphasis' });
              break;

            case 'em_close':
              close();
              break;

            case 'link_open':
              open({
                type: 'link',
                meta: { href: child.attrGet('href') || '' },
              });
              break;

            case 'link_close':
              close();
              break;

            case 'code_inline':
              push({
                type: 'inlineCode',
                value: child.content,
              });
              break;

            case 'softbreak':
            case 'hardbreak':
              push({ type: 'break' });
              break;
          }
        }
        break;

      // Default: ignore or log
      default:
        // you can optionally push a meta node for unknown tokens
        // push({ type: 'meta', meta: { tokenType: t.type } });
        break;
    }
  }

  return root;
}

//-----------------------------------------
// NOTE:
// If addinng custom tokens (for frontmatter, demos, ULDE blocks) later, can extend this switch with those types and map them to ULDEFrontmatterNode, ULDEDemoNode, ULDEUldeBlockNode, etc.
//-------------------------------------

```

#### 4-3. ulde-ast-renderer.engine.ts
```ts
// src/ulde/engine/ulde-ast-renderer.engine.ts

import { ULDEAstNode } from '@ulde/types/context';

export function renderUldeAstToHtml(nodes: ULDEAstNode[]): string {
  const buf: string[] = [];

  const renderNode = (node: ULDEAstNode) => {
    switch (node.type) {

      // ---------------------------------------------------------
      // Block nodes
      // ---------------------------------------------------------
      case 'heading': {
        // buf.push(`<h${node.depth} id=${node.meta?.['id']}>`);

        // const anchor = node.children?.map(c => c?.children?.filter(c => c.type === 'anchor'));
        // const id = anchor?.map(c=>c?.filter(c=> (c.meta?.['id'] !==null))).join('')??'';
        // buf.push(`<h${node.depth} id="${id}">`);

        buf.push(`<h${node.depth}>`);
        node.children?.forEach(renderNode);
        buf.push(`</h${node.depth}>`);
        break;
      }

      case 'paragraph': {
        buf.push('<p>');
        node.children?.forEach(renderNode);
        buf.push('</p>');
        break;
      }

      case 'blockquote': {
        buf.push('<blockquote>');
        node.children?.forEach(renderNode);
        buf.push('</blockquote>');
        break;
      }

      case 'list': {
        const ordered = node.meta?.['ordered'] === true;
        buf.push(ordered ? '<ol>' : '<ul>');
        node.children?.forEach(renderNode);
        buf.push(ordered ? '</ol>' : '</ul>');
        break;
      }

      case 'listItem': {
        buf.push('<li>');
        node.children?.forEach(renderNode);
        buf.push('</li>');
        break;
      }

      case 'thematicBreak': {
        buf.push('<hr />');
        break;
      }

      // ---------------------------------------------------------
      // Inline nodes
      // ---------------------------------------------------------
      case 'text': {
        buf.push(escapeHtml(node.value ?? ''));
        break;
      }

      case 'strong': {
        buf.push('<strong>');
        node.children?.forEach(renderNode);
        buf.push('</strong>');
        break;
      }

      case 'emphasis': {
        buf.push('<em>');
        node.children?.forEach(renderNode);
        buf.push('</em>');
        break;
      }

      case 'inlineCode': {
        buf.push('<code>');
        buf.push(escapeHtml(node.value ?? ''));
        buf.push('</code>');
        break;
      }

      case 'break': {
        buf.push('<br />');
        break;
      }

      case 'link': {
        const href = escapeHtml(node.meta?.['href'] ?? '');
        const title = node.meta?.['title']
          ? ` title="${escapeHtml(node.meta?.['title'])}"`
          : '';
        buf.push(`<a href="${href}"${title}>`);
        node.children?.forEach(renderNode);
        buf.push('</a>');
        break;
      }

      case 'image': {
        const src = escapeHtml(node.meta?.['src'] ?? '');
        const alt = escapeHtml(node.meta?.['alt'] ?? '');
        const title = node.meta?.['title']
          ? ` title="${escapeHtml(node.meta?.['title'])}"`
          : '';
        buf.push(`<img src="${src}" alt="${alt}"${title} />`);
        break;
      }

      // ---------------------------------------------------------
      // Code & math
      // ---------------------------------------------------------
      case 'code': {
        const langClass = node.lang ? ` class="language-${escapeHtml(node.lang)}"` : '';
        buf.push(`<pre><code${langClass}>`);
        buf.push(escapeHtml(node.value ?? ''));
        buf.push('</code></pre>');
        break;
      }

      case 'math': {
        buf.push(`<div class="ulde-math">`);
        buf.push(escapeHtml(node.value ?? ''));
        buf.push('</div>');
        break;
      }

      case 'inlineMath': {
        buf.push(`<span class="ulde-math-inline">`);
        buf.push(escapeHtml(node.value ?? ''));
        buf.push('</span>');
        break;
      }

      // ---------------------------------------------------------
      // ULDE custom nodes (minimal handling)
      // ---------------------------------------------------------
      case 'admonition': {
        const kind = node.meta?.['kind'] ?? 'info';
        const title = node.meta?.['title'] ?? '';
        buf.push(`<div class="ulde-admonition ulde-admonition-${escapeHtml(kind)}">`);
        if (title) {
          buf.push(`<div class="ulde-admonition-title">${escapeHtml(title)}</div>`);
        }
        buf.push('<div class="ulde-admonition-body">');
        node.children?.forEach(renderNode);
        buf.push('</div></div>');
        break;
      }

      case 'uldeBlock': {
        const name = node.meta?.['name'] ?? 'block';
        buf.push(`<div class="ulde-block ulde-block-${escapeHtml(name)}">`);
        node.children?.forEach(renderNode);
        buf.push('</div>');
        break;
      }

      case 'demo': {
        const id = node.meta?.['id'] ?? '';
        buf.push(`
          <div class="ulde-demo"
          data-demo-id="${escapeHtml(id)}"
          data-demo-code="${escapeHtml(node.meta?.['code'])}">
          <pre>${escapeHtml(node.meta?.['code'])}</pre>
          `);
        // buf.push(`
        //   <div class="ulde-demo" data-demo-id="${escapeHtml(id)}">
        //   `);
        node.children?.forEach(renderNode);
        buf.push('</div>');
        break;
      }

      case 'toc': {
        buf.push('<div class="ulde-toc"></div>');
        break;
      }

      case 'anchor': {
        const id = node.meta?.['id'] ?? '';
        buf.push(`<a id="${escapeHtml(id)}" data-ulde-anchor="${escapeHtml(id)}"></a>`);

        // console.log(`Log: [ulde-ast-renderer.engine.ts renderUldeAstToHtml()]  \nnode type=anchor`, id);
        // buf.push(`<a id="${escapeHtml(id)}"></a>`);
        break;
      }

      case 'section': {
        buf.push('<section>');
        node.children?.forEach(renderNode);
        buf.push('</section>');
        break;
      }

      case 'diagnostic': {
        const level = node.meta?.['level'] ?? 'info';
        const message = escapeHtml(node.meta?.['message'] ?? '');
        const phase = node.meta?.['lifecyclePhase'];
        const plugin = node.meta?.['pluginName'];

        buf.push(`<div class="ulde-diagnostic ulde-diagnostic-${level}">`);
        buf.push(`<strong>${level.toUpperCase()}</strong>: ${message}`);

        if (phase) {
          buf.push(`<span class="meta"> (phase: ${escapeHtml(phase)})</span>`);
        }

        if (plugin) {
          buf.push(`<span class="meta"> (plugin: ${escapeHtml(plugin)})</span>`);
        }

        buf.push(`</div>`);
        break;
      }


      // ---------------------------------------------------------
      // Fallback: render children only
      // ---------------------------------------------------------
      default: {
        node.children?.forEach(renderNode);
        break;
      }
    }
  };

  nodes.forEach(renderNode);


  // return buf.join('');

  const html = buf.join('');

  return html;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

```
#### 4-4. ulde-ast-visitor.engine.ts
```ts
// src/ulde/engine/ulde-ast-visitor.engine.ts

import { ULDEAstNode } from '@ulde/types/context';

export type ULDEAstVisitorFn = (
  node: ULDEAstNode,
  parent: ULDEAstNode | null
) => void | ULDEAstNode | null;

export interface ULDEAstVisitorOptions {
  pre?: ULDEAstVisitorFn;
  post?: ULDEAstVisitorFn;
}

/**
 * ULDE AST Visitor
 * Walks the AST tree and allows mutation, replacement, or removal of nodes.
 */
export function visitUldeAst(
  nodes: ULDEAstNode[],
  options: ULDEAstVisitorOptions
): ULDEAstNode[] {

  const { pre, post } = options;

  const walk = (node: ULDEAstNode, parent: ULDEAstNode | null): ULDEAstNode | null => {

    // PRE-VISIT (before children)
    if (pre) {
      const result = pre(node, parent);

      if (result === null) {
        return null; // remove node
      }

      if (result && result !== node) {
        node = result; // replace node
      }
    }

    // Visit children
    if (node.children && node.children.length > 0) {
      const newChildren: ULDEAstNode[] = [];

      for (const child of node.children) {
        const visited = walk(child, node);
        if (visited !== null) {
          newChildren.push(visited);
        }
      }

      node.children = newChildren;
    }

    // POST-VISIT (after children)
    if (post) {
      const result = post(node, parent);

      if (result === null) {
        return null; // remove node
      }

      if (result && result !== node) {
        node = result; // replace node
      }
    }

    return node;
  };

  // Walk root array
  const result: ULDEAstNode[] = [];

  for (const node of nodes) {
    const visited = walk(node, null);
    if (visited !== null) {
      result.push(visited);
    }
  }

  return result;
}

```

#### 4-5. ulde-content.engine.service.ts
```ts
// src/ulde/engine/ulde-content.engine.service.ts

import { inject, Injectable } from '@angular/core';

import { navigate } from '../../app/global.utils/global.utils';
import { Router } from '@angular/router';


import MarkdownIt from 'markdown-it';

import Token from 'markdown-it/lib/token.mjs';


@Injectable({
  providedIn: 'root',
})
export class ContentEngineService {

  title = "ContentEngineService";

  async load(pageId: string): Promise<string | undefined> {
    /* existing loader */


    const url = `assets/${pageId}.md`;

    try {
      const response = await fetch(url);

      if (response.redirected) {
        const router = inject(Router);
        navigate(router, ['PageNotFound']);
        throw new Error(`Invalid URL: ${url}`);
      }

      const raw = await response.text();


      // console.log(`Log: ${this.title} load \nid=`, pageId, `raw=`, raw);

      return raw;

    } catch (err) {
      console.error(`${this.title} load() error:`, err);
      return undefined;
    }

  }
  async transform(raw: string): Promise<Token[]> {
    /* existing parser */

    const md = new MarkdownIt();
    const tokens = md.parse(raw, {});

    return tokens;

  }
}

```

#### 4-6. ulde-interactive.engine.service.ts
```ts
// src/ulde/engine/ulde-interactive.engine.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class InteractiveEngineService {

  hydrate(pageId: string) {
    // find demo placeholders, bootstrap Angular components, etc.
  }

}

```

#### 4-7. ulde-layout.engine.service.ts
```ts
// src/ulde/engine/ulde-layout.engine.service.ts

import { Injectable } from '@angular/core';
import { ULDEAstNode, ULDESectionNode, ULDEHeadingNode } from '@ulde/types/context';

@Injectable({ providedIn: 'root' })
export class ULDELayoutEngineService {

  buildSections(ast: ULDEAstNode[]): ULDEAstNode[] {
    const result: ULDEAstNode[] = [];
    let currentSection: ULDESectionNode | null = null;

    for (const node of ast) {
      if (node.type === 'heading') {
        // start a new section
        const section: ULDESectionNode = {
          type: 'section',
          meta: {
            id: slugify(collectHeadingText(node)),
            depth: (node as ULDEHeadingNode).depth
          },
          children: [node]
        };

        result.push(section);
        currentSection = section;
      } else if (currentSection) {
        // attach node to current section
        currentSection.children!.push(node);
      } else {
        // content before first heading stays at root
        result.push(node);
      }
    }

    return result;
  }
}

function collectHeadingText(node: ULDEAstNode): string {
  return (node.children || [])
    .filter(c => c.type === 'text')
    .map(c => c.value ?? '')
    .join('');
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

```


#### 4-8. ulde-render-context-builder.engine.service.ts
```ts
// src/ulde/engine/ulde-render-context-builder.engine.service.ts

import { Injectable } from '@angular/core';
import { ULDEPageContext, ULDERenderContext } from '@ulde/types/context';
import { buildUldeAst } from './ulde-ast-builder.engine';
import { renderUldeAstToHtml } from './ulde-ast-renderer.engine';
import { visitUldeAst } from './ulde-ast-visitor.engine';
import { ULDELayoutEngineService } from './ulde-layout.engine.service';

import { ULDEDiagnosticNode } from '@ulde/types/context';
import { ULDEOverlayService } from '@ulde/core/overlay';
import { ULDEDiagnostic } from '@ulde/types';


@Injectable({ providedIn: 'root' })
export class ULDERenderContextBuilderService {


  constructor(
    private layoutEngine: ULDELayoutEngineService,
    private overlay: ULDEOverlayService,
  ) { }

  async build(page: ULDEPageContext): Promise<ULDERenderContext> {

    // 1. Build AST
    const ast = buildUldeAst(page.token);

    // layout: sections
    const sectionAst = this.layoutEngine.buildSections(ast);

    // 🔥 Inject diagnostics into AST
    const diagnostics = this.overlay.diagnostics();
    const diagnosticNodes: ULDEDiagnosticNode[] = diagnostics.map((d: ULDEDiagnostic) => ({
      type: 'diagnostic',
      meta: {
        level: d.level,
        message: d.message,
        // code: d.code
        lifecyclePhase: d.lifecyclePhase,
        pluginName: d.pluginName
      }
    }));

    // Append diagnostics at the end of the AST
    const finalAst = [...sectionAst, ...diagnosticNodes];
    console.log(`Log: [ULDERenderContextBuilderServic] finalAst=`, finalAst);


    // 3. Render HTML
    const html = renderUldeAstToHtml(finalAst);
    // console.log(`Log: [ULDERenderContextBuilderServic] 3. Render HTML FINISHED! \nhtml=`, html);

    // 4. Assemble render context
    const currentFrame = this.overlay.currentFrame();
    return {
      pageId: page.pageId,
      ast: finalAst, //sectionAst,
      // html: '',
      html,
      layout: 'sections',
      frame: (currentFrame !== null) ? currentFrame : undefined,
    };
  }
}

```

### 5. src/ulde/plugins/

#### 5-1. contributor/

Maybe for the future

#### 5-2. registry/

##### 5-2-1. index.ts
```ts
// src/ulde/plugins/registry/index.ts

export * from './ulde-plugin-registry';

```

##### 5-2-2. ulde-plugin-registry.ts
```ts
// src/ulde/plugins/registry/ulde-plugin-registry.ts

// ------------------------------
// content PLUGINS
// ------------------------------
import { CodeBlockEnhancer } from '@ulde/plugins/system/content';
import { FrontmatterNormalizer } from '@ulde/plugins/system/content';

// ------------------------------
// Layout PLUGINS
// ------------------------------
import { AutoAnchors, AutoTOC } from '@ulde/plugins/system/layout';

// ------------------------------
//Interactive PLUGINS
// ------------------------------
import { createDummyTestPlugin } from '@ulde/plugins/system/interactive';

// ------------------------------
// Navigation PLUGINS
// ------------------------------
import { Breadcrumbs } from '@ulde/plugins/system/navigation'

// ------------------------------
// ulde PLUGINS
// ------------------------------
import { OverlayCustomPanel } from '@ulde/plugins/system/ulde'
import { SlowPluginDetector } from '@ulde/plugins/system/ulde'
import { TimelineProfiler } from '@ulde/plugins/system/ulde'
import { DemoBlockPlugin } from '@ulde/plugins/system';


// -----------------------------------------------------
// BUILD REGISTRY (ORDER MATTERS) - String World
// -----------------------------------------------------
export function createUldeStringPluginRegistry() {
  return [
    // Content PHASE
    CodeBlockEnhancer,
    FrontmatterNormalizer,

    // Layout
    AutoAnchors,
    AutoTOC,
    DemoBlockPlugin,

    // Interactive PHASE
    createDummyTestPlugin(),

    // Navigation PHASE
    Breadcrumbs,

    //ulde Phase
    OverlayCustomPanel,
    SlowPluginDetector,
    TimelineProfiler
  ];

}

```

#### 5-3. system/

##### 5-3-1. content/

###### 5-3-1-1. index.ts
```ts
// src/ulde/plugins/system/content/index.ts

export * from "./ulde-codeblock.plugin";
export * from "./ulde-frontmatter-normalizer.plugin";

```

###### 5-3-1-2. ulde-codeblock.plugin.ts
```ts
// src/ulde/plugins/system/content/ulde-codeblock.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";

export const CodeBlockEnhancer: ULDEPlugin = {
  pluginKind: 'content',
  pluginName: "CodeblockEnhancer",
  description: "Markdown Code Block Enhancer: Enhances fenced code blocks with metadata",
  enabled: true,
  hooks: {
    async onPageLoad(ctx) {
      if (ctx.raw === undefined) return;

      ctx.raw = ctx.raw.replace(/```(\w+)/g, ((m: any, lang: any) => {
        return `\`\`\`${lang} data-lang="${lang}"`;
      }));
    },

    async onBeforeRender(ctx) {
      if (ctx.html === undefined) return;

      const html = ctx.html.replace(
        /<pre><code class="language-(\w+)">/g,
        ((m: any, lang: any) => `<pre data-lang="${lang}"><code class="language-${lang}">`
        ));

      ctx.html = html;
    }
  }
};

```

###### 5-3-1-3. ulde-frontmatter-normalizer.plugin.ts
```ts
// src/ulde/plugins/system/content/ulde-frontmatter-normalizer.plugin.ts

import { ULDEPlugin } from '@ulde/types/plugin';

export const FrontmatterNormalizer: ULDEPlugin = {
  pluginKind: 'content',
  pluginName: "FrontmatterNormalizer",
  description: "Normalizes frontmatter fields",
  enabled: true,
  hooks: {
    onPageLoad(ctx) {
      ctx.meta['title'] ??= "Untitled";
      ctx.meta['tags'] ??= [];
      ctx.meta['updated'] ??= new Date().toISOString();
    }
  }
};

```

##### 5-3-2. demo/

###### 5-3-2-1. index.ts
```ts
// src/ulde/plugins/system/demo/index.ts

export * from "./ulde-demo.plugin";
export * from "./ulde-playground-injector.plugin";

```


###### 5-3-2-2. ulde-demo.plugin.ts
```ts
// src/ulde/plugins/system/demo/ulde-demo.plugin.ts

import { ULDEPlugin } from '@ulde/types/plugin';
import { visitUldeAst } from '@ulde/engine';

export const DemoBlockPlugin: ULDEPlugin = {
  pluginKind: 'demo',
  pluginName: 'demo-block',
  description: 'Convert fenced code blocks with demo info into ULDE demo nodes.',
  enabled: true,
  hooks: {
    onBeforeRender(ctx) {
      visitUldeAst(ctx.ast, {
        pre(node) {
          if (node.type === 'code' && node.lang?.startsWith('demo')) {
            const parts = node.lang.split(/\s+/);
            const idPart = parts.find(p => p.startsWith('id='));
            const id = idPart ? idPart.split('=')[1] : 'demo';

            return {
              type: 'demo',
              meta: {
                id,
                code: node.value,
                lang: 'javascript'
              },
              children: []
            };
          } else{
            return undefined;
          }

        }
      });
    }
  }
};

```

###### 5-3-2-3. ulde-playground-injector.plugin.ts
```ts
// src/ulde/plugins/system/demo/ulde-playground-injector.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";

import { createComponent, EnvironmentInjector } from "@angular/core";
import { Example02 } from "../../../../app/demo/example02/example02"; // TBD

export const PlaygroundInjector: ULDEPlugin = {
  pluginKind: 'demo',
  pluginName: "PlaygroundInjector",
  description: "Hydrates <demo-playground> blocks into live Angular components",
  enabled: true,
  hooks: {
    async onAfterRender(ctx) {
      const placeholders = document.querySelectorAll("demo-playground");
      // You must provide the Angular environment injector
      const injector = (window as any).ngEnvironment as EnvironmentInjector;

      for (const el of placeholders) {
        const cmpRef = createComponent(Example02, {
          hostElement: el,
          environmentInjector: injector
        });

        cmpRef.changeDetectorRef.detectChanges();
      }
    }
  }
};

```

##### 5-3-3. interactive/

###### 5-3-3-1. index.ts
```ts
// src/ulde/plugins/system/interactive/index.ts

export * from "./ulde-dummy-test.plugin";

```

###### 5-3-3-2. ulde-dummy-test.plugin.ts
```ts
// src/ulde/plugins/system/interactive/ulde-dummy-test.plugin.ts


import { ULDERenderContext } from '@ulde/types/context';
import { ULDEPlugin } from '@ulde/types/plugin';

export function createDummyTestPlugin(): ULDEPlugin {
  return {
    pluginKind: 'content',
    pluginName: 'DummyTestPlugin',
    version: '0.0.1',
    description: 'create dummy test plugin',
    enabled: true,
    hooks: {

      onBeforeRender(ctx: ULDERenderContext) {
        const { frame } = ctx;

        /**
         * To be coded
         */


      },
    }
  };
}

```

##### 5-3-4. layout/

###### 5-3-4-1. index.ts
```ts
// src/ulde/plugins/system/layout/index.ts

export * from "./ulde-anchor.plugin";
export * from "./ulde-toc.plugin";

```

###### 5-3-4-2. ulde-anchor.plugin.ts
```ts
// src/ulde/plugins/system/layout/ulde-anchor.plugin.ts

import { ULDEPlugin } from '@ulde/types/plugin';
import { visitUldeAst } from '@ulde/engine';

export const AutoAnchors: ULDEPlugin = {
  pluginKind: 'layout',
  pluginName: 'auto-anchors',
  description: 'Add <a id="slug"></a> before each heading.',
  enabled: true,
  hooks: {
    onBeforeRender(ctx) {

      console.log(`Log: [AutoAnchors Plugin] onBeforeRender`);

      visitUldeAst(ctx.ast, {
        pre(node) {
          if (node.type === 'heading') {
            const text = node.children
              ?.filter(c => c.type === 'text')
              .map(c => c.value)
              .join('') ?? '';

            const id = slugify(text);

            // Inject anchor node at the beginning of heading children
            node.children?.unshift({
              type: 'anchor',
              meta: { id }
            });
          }
        }
      });
    }
  }
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

```

###### 5-3-4-3. ulde-toc.plugin.ts
```ts
// src/ulde/plugins/system/layout/ulde-toc.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";
import { ULDERenderContext } from "@ulde/types/context";
import { visitUldeAst, renderUldeAstToHtml } from "@ulde/engine";

// import { renderUldeAstToHtml } from './ulde-ast-renderer.engine';

export const AutoTOC: ULDEPlugin = {
  pluginKind: 'layout',
  pluginName: "auto-toc",
  description: "Generates a table of contents from headings",
  enabled: true,
  hooks: {
    async onBeforeRender(ctx: ULDERenderContext) {

      // console.log(`Log: [AutoToc Plugin] onBeforeRender`);

      // const headings = ctx.ast.map(n =>
      //   n.children?.filter((n: any) => /^h[1-6]$/.test(n.tag))
      // );
      // const tocHtml = headings
      //   .map((h: any) => `<li><a href="#${h.id}">${h.text}</a></li>`)
      //   .join("");

      // ctx.html = `<nav class="toc"><ul>${tocHtml}</ul></nav>` + ctx.html;

      const headings: { depth: number; text: string }[] = [];

      // Collect headings
      visitUldeAst(ctx.ast, {
        pre(node) {
          if (node.type === 'heading') {
            const text = node.children
              ?.filter(c => c.type === 'text')
              .map(c => c.value)
              .join('') ?? '';
            headings.push({ depth: node.depth!, text });
          }
        }
      });

      // Build TOC AST node
      const tocNode = {
        type: 'toc',
        children: headings.map(h => ({
          type: 'link',
          meta: { href: `#${slugify(h.text)}` },
          children: [{ type: 'text', value: h.text }]
        }))
      };

      // Inject TOC at top
      ctx.ast.unshift(tocNode);
      console.log(`Log: AutoTOC Plugin] onBeforeRender \nctx.ast=`, ctx.ast);

      // // New addition in debugginf
      // const ast = ctx.ast;
      // ctx.html = renderUldeAstToHtml(ast);

    },

    // onAfterRender(ctx) {
    //   const headings: { depth: number; id: string, text: string }[] = [];
    //   visitUldeAst(ctx.ast, {
    //     pre(node) {
    //       if (node.type === 'section') {
    //         const id = node.meta?.['id'];
    //         const depth = node.meta?.['depth'];

    //         const heading = node.children?.map(c => c)
    //           .filter(c => c.type === 'heading');

    //         const anchor = heading?.map(c => c?.children?.filter(c => c.type==='anchor'));
    //         // ?.map(c=>c).filter(c => c.type ==='anchor');
    //         // .filter(c => c.type==='anchor');
    //         const text = heading?.map(c => c?.children?.filter(c => c.type==='text')).map(c => c?.values).join('') ?? '';;

    //           // .filter(c => c?.type === 'anchor').join('') ?? '';


    //         headings.push({ depth: depth, id: id, text });
    //       }
    //     }
    //   });



    //   console.log(`Log: AutoTOC Plugin] onAfterRender \nheadins=\n`, headings);

    //   const tocHtml = headings
    //     .map((h: any) => `<li><a href="#${h.id}">${h.text}</a></li>`)
    //     .join("");

    //   ctx.html = `<nav class="toc"><ul>${tocHtml}</ul></nav>` + ctx.html;


    //   console.log(`Log: AutoTOC Plugin] onAfterRender \nctx.html=\n`, ctx.html);
    // },

  }

};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

```

##### 5-3-5. navigation/

###### 5-3-5-1. index.ts
```ts
// src/ulde/plugins/system/navigation/index.ts

export * from "./ulde-navigation-breadcrumbs.plugin";

```

###### 5-3-5-2. ulde-navigation-breadcrumbs.plugin.ts
```ts
// src/ulde/plugins/system/navigation/ulde-navigation-breadcrumbs.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";

export const Breadcrumbs: ULDEPlugin = {
  pluginKind: 'navigation',
  pluginName: "Breadcrumbs",
  description: "Generates breadcrumb navigation from route",
  enabled: true,
  hooks: {
    onPageLoad(ctx) {
      const parts = ctx.raw.split("/").filter(Boolean);
      ctx.meta['breadcrumbs'] = parts.map((p, i) => ({
        label: p,
        href: "/" + parts.slice(0, i + 1).join("/")
      }));
    }
  }
};

```

##### 5-3-6. ulde/

###### 5-3-6-1. index.ts
```ts
// src/ulde/plugins/system/ulde/index.ts

export * from "./ulde-overlay-custom-panel.plugin";
export * from './ulde-slow-plugin-detector.plugin'
export * from './ulde-timeline-profiler.plugin'

```

###### 5-3-6-2. ulde-overlay-custom-panel.plugin.ts
```ts
// src/ulde/plugins/system/ulde/ulde-overlay-custom-panel.plugin.ts

import { ULDEPlugin } from "@ulde/types//plugin";

export const OverlayCustomPanel: ULDEPlugin = {
  pluginKind: 'ulde',
  pluginName: "OverlayCustomPanel",
  description: "Adds a custom panel to the ULDE overlay",
  enabled: true,
  hooks: {
    // onInit() {
    //   const panel = document.createElement("div");
    //   panel.className = "ulde-custom-panel";
    //   panel.innerHTML = "<strong>Custom ULDE Panel</strong>";
    //   document.body.appendChild(panel);
    // },

    async onAfterRender(ctx) {

      const customPanel: string = `
      <div class="ulde-custom-panel">
      <strong>Custom ULDE Panel</strong>
      </div>
      `;

      ctx.html = customPanel;

    }

  }
};

```

###### 5-3-6-3. ulde-slow-plugin-detector.plugin.ts
```ts
// src/ulde/plugins/system/ulde/ulde-slow-pluging-detector.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";
import { ULDEPluginTiming } from "@ulde/types/timing";

export const SlowPluginDetector: ULDEPlugin = {
  pluginKind: 'ulde',
  pluginName: "SlowPluginDetector",
  description: "Warns when plugin execution exceeds threshold",
  enabled: true,
  hooks: {
    async onAfterRender(ctx) {
      if (ctx.frame === undefined) return;
      
      const timings: ULDEPluginTiming[] = ctx.frame.pluginTimings; // ULDE exposes timing store
      // const timings = window.ULDE.timings; // ULDE exposes timing store
      const threshold = 8; // ms

      for (const t of timings) {
        if (t.duration > threshold) {
          console.warn(
            `[ULDE] Plugin "${t.pluginName}" exceeded ${threshold}ms: ${t.duration}ms`
          );
        }
      }
    }
  }
};

```

###### 5-3-6-4. ulde-timeline-profiler.plugin.ts
```ts
// src/ulde/plugins/system/ulde/ulde-timeline-profiler.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";

export const TimelineProfiler: ULDEPlugin = {
  pluginKind: 'ulde',
  pluginName: "TimelineProfiler",
  description: "Logs ULDE phase durations to console",
  enabled: true,
  hooks: {
    onInit() {
      console.log("[ULDE] Timeline profiler initialized");
    },

    onDestroy() {
      console.log("[ULDE] Timeline profiler destroyed");
    }
  }
};

```

##### 5-3-7. index.ts
```ts
// src/ulde/plugins/system/index.ts

export * from "./content/index";
export * from "./demo/index";
export * from "./interactive/index";
export * from "./layout/index";
export * from "./navigation/index";
export * from "./ulde/index";

```

#### 5-4. index.ts
```ts
// src/ulde/plugins/index.ts

export * from "./registry/index";
export * from "./system/index";

```

### 6. src/ulde/tools/

Maybe for the future

### 7. src/ulde/types/

#### 7-1. context/

##### 7-1-1. index.ts

```ts
// src/ulde/types/context/index.ts

export * from "./ulde-context.types";

```

##### 7-1-2. udel-context.types.ts
```ts
// src/ulde/types/context/ulde-context.types.ts

import type Token from 'markdown-it/lib/token.mjs';
import { ULDEFrame } from "@ulde/types/frame";
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';
import { ULDEPluginTiming } from '@ulde/types/timing';
import { ULDEPluginKind } from '@ulde/types/plugin';
import { ULDEDiagnosticLevel } from '@ulde/types/diagnostic';
// import { UldeArtifacts } from "@ulde/types/ulde-artifacts";
// ---------------------------------------------------------
// ULDE Context Objects
// ---------------------------------------------------------


export interface ULDEAstNode {
  type: string;
  children?: ULDEAstNode[];
  value?: string;
  depth?: number;
  lang?: string;
  meta?: Record<string, any>;
}

export interface ULDEPageContext {
  pageId: string;
  raw: string;
  token: Token[];
  meta: Record<string, any>;
}

export interface ULDERenderContext {
  pageId: string;
  ast: ULDEAstNode[];
  html: string;
  layout?: string;
  frame?: ULDEFrame; // optional, attached after lifecycle, as “observability attachment”
}

// Block Nodes
export interface ULDEHeadingNode extends ULDEAstNode {
  type: 'heading';
  depth: number;
}

export interface ULDEParagraphNode extends ULDEAstNode {
  type: 'paragraph';
}

export interface ULDEBlockquoteNode extends ULDEAstNode {
  type: 'blockquote';
}

export interface ULDEListNode extends ULDEAstNode {
  type: 'list';
  meta: {
    ordered: boolean;
  };
}

export interface ULDEListItemNode extends ULDEAstNode {
  type: 'listItem';
}

export interface ULDETableNode extends ULDEAstNode {
  type: 'table';
}

export interface ULDETableRowNode extends ULDEAstNode {
  type: 'tableRow';
}

export interface ULDETableCellNode extends ULDEAstNode {
  type: 'tableCell';
}

export interface ULDEThematicBreakNode extends ULDEAstNode {
  type: 'thematicBreak';
}

// Inline Nodes
export interface ULDETextNode extends ULDEAstNode {
  type: 'text';
  value: string;
}

export interface ULDEEmphasisNode extends ULDEAstNode {
  type: 'emphasis';
}

export interface ULDEStrongNode extends ULDEAstNode {
  type: 'strong';
}

export interface ULDEInlineCodeNode extends ULDEAstNode {
  type: 'inlineCode';
  value: string;
}

export interface ULDEBreakNode extends ULDEAstNode {
  type: 'break';
}

export interface ULDELinkNode extends ULDEAstNode {
  type: 'link';
  meta: {
    href: string;
    title?: string;
  };
}

export interface ULDEImageNode extends ULDEAstNode {
  type: 'image';
  meta: {
    src: string;
    alt?: string;
    title?: string;
  };
}

// Structural Nodes
export interface ULDERootNode extends ULDEAstNode {
  type: 'root';
}

export interface ULDESectionNode extends ULDEAstNode {
  type: 'section';
  meta: {
    id?: string;
    depth?: number;
  };
}

export interface ULDEFrontmatterNode extends ULDEAstNode {
  type: 'frontmatter';
  meta: Record<string, any>;
}

// Code & Media Nodes
export interface ULDECodeNode extends ULDEAstNode {
  type: 'code';
  lang?: string;
  value: string;
}

export interface ULDEFenceNode extends ULDEAstNode {
  type: 'fence';
  lang?: string;
  value: string;
}

export interface ULDEMathNode extends ULDEAstNode {
  type: 'math';
  value: string;
}

export interface ULDEInlineMathNode extends ULDEAstNode {
  type: 'inlineMath';
  value: string;
}

// ULDE Custom Nodes
export interface ULDEUldeBlockNode extends ULDEAstNode {
  type: 'uldeBlock';
  meta: {
    name: string;
    options?: Record<string, any>;
  };
}

export interface ULDEAdmonitionNode extends ULDEAstNode {
  type: 'admonition';
  meta: {
    kind: 'info' | 'warning' | 'danger' | 'success';
    title?: string;
  };
}

export interface ULDEDemoNode extends ULDEAstNode {
  type: 'demo';
  meta: {
    id: string;
    code: string;
    lang?: string;
  };
}

export interface ULDEComponentNode extends ULDEAstNode {
  type: 'component';
  meta: {
    name: string;
    props?: Record<string, any>;
  };
}

export interface ULDETocNode extends ULDEAstNode {
  type: 'toc';
}

export interface ULDEAnchorNode extends ULDEAstNode {
  type: 'anchor';
  meta: {
    id: string;
  };
}

// Meta Nodes
export interface ULDEPositionNode extends ULDEAstNode {
  type: 'position';
  meta: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface ULDEMetaNode extends ULDEAstNode {
  type: 'meta';
  meta: Record<string, any>;
}

export interface ULDEDiagnosticNode extends ULDEAstNode {
  type: 'diagnostic';
  meta: {
    level: ULDEDiagnosticLevel;
    message: string;
    code?: string;
    lifecyclePhase?: ULDELifecyclePhase;
    pluginName?: string;
    pluginKind?: ULDEPluginKind;
  };
}

// Full ULDE AST Node Type Union
export type ULDEAstNodeUnion =
  | ULDEHeadingNode
  | ULDEParagraphNode
  | ULDEBlockquoteNode
  | ULDEListNode
  | ULDEListItemNode
  | ULDETableNode
  | ULDETableRowNode
  | ULDETableCellNode
  | ULDEThematicBreakNode
  | ULDETextNode
  | ULDEEmphasisNode
  | ULDEStrongNode
  | ULDEInlineCodeNode
  | ULDEBreakNode
  | ULDELinkNode
  | ULDEImageNode
  | ULDERootNode
  | ULDESectionNode
  | ULDEFrontmatterNode
  | ULDECodeNode
  | ULDEFenceNode
  | ULDEMathNode
  | ULDEInlineMathNode
  | ULDEUldeBlockNode
  | ULDEAdmonitionNode
  | ULDEDemoNode
  | ULDEComponentNode
  | ULDETocNode
  | ULDEAnchorNode
  | ULDEPositionNode
  | ULDEMetaNode
  | ULDEDiagnosticNode;

```

#### 7-2. debug/

##### 7-2-1. index.ts
```ts
// src/ulde/types/debug/index.ts

export * from "./ulde-debug.types";

```

##### 7-2-2. ulde-debug.types.ts
```ts
// src/ulde/types/debug/ulde-debug.types.ts

import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";
import { ULDEPluginKind, ULDEPluginHooks } from "../plugin/ulde-plugin.types";

// ---------------------------------------------------------
// ULDE Debug Tools Types
// ---------------------------------------------------------

export interface ULDETimelinePoint {
  frameId: string;
  totalDuration: number;
  phases: {
    lifecyclePhase: ULDELifecyclePhase;
    duration: number;
  }[];
}

export interface ULDEHeatmapCell {
  pluginName: string;
  pluginKind: ULDEPluginKind;
  hookName: keyof ULDEPluginHooks;
  intensity: number; // normalized 0–1
}

```

#### 7-3. diagnostic/

##### 7-3-1. index.ts
```ts
// src/ulde/types/diagnostic/index.ts

export * from "./ulde-diagnostic.types";

```

##### 7-3-2. ulde-diagnostic.types.ts
```ts
// src/ulde/types/diagnostic/ulde-diagnostic.types.ts

import { ULDEPluginKind } from "@ulde/types/plugin";
import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";


// ULDE Diagnostics
export type ULDEDiagnosticLevel = 'info' | 'warn' | 'error';

export interface ULDEDiagnostic {
  level: ULDEDiagnosticLevel;
  message: string;
  lifecyclePhase?: ULDELifecyclePhase;
  pluginName?: string;
  pluginKind?: ULDEPluginKind;
}

```

#### 7-4. frame/

##### 7-4-1. index.ts
```ts
// src/ulde/types/frame/index.ts

export * from "./ulde-frame.types";

```

##### 7-4-2. ulde-frame.types.ts
```ts
// src/ulde/types/frame/ulde-frame.types.ts

import { ULDEDiagnostic } from "@ulde/types/diagnostic";
import { ULDELifecyclePhaseTiming } from "@ulde/types/lifecycle";
import { ULDEPluginTiming } from "@ulde/types/timing";

// ---------------------------------------------------------
// ULDE Frame
// Use ULDEFrame for introspection, not for endering
//---------------------------------------------------------

export interface ULDEFrame {
  id: string;
  timestamp: number;
  lifecyclePhaseTimings: ULDELifecyclePhaseTiming[];
  pluginTimings: ULDEPluginTiming[];
  diagnostics: ULDEDiagnostic[] //warning or error generated by ULDE
}

```

#### 7-5. lifecycle/

##### 7-5-1. index.ts
```ts
// src/ulde/types/lifecycle/index.ts

export * from "./ulde-lifecycle.types";

```

##### 7-5-2. ulde-lifecycle.types.ts
```ts
// src/ulde/types/lifecycle/ulde-lifecycle.types.ts

//---------------------------------------------------------
// ULDE Lifecycle Phases
// a single execution of one lifecycle phase:---------------------------------------------------------

export type ULDELifecyclePhase =
  | 'init'
  | 'load'
  | 'render'
  | 'hydrate'
  | 'afterRender';

export interface ULDELifecyclePhaseTiming {
  lifecyclePhase: ULDELifecyclePhase;
  startTime: number;
  endTime: number;
  duration: number;
}

```

#### 7-6. plugin/

##### 7-6-1. index.ts
```ts
// src/ulde/types/plugin/index.ts

export * from "./ulde-plugin.types";

```

##### 7-6-2. ulde-plugin.types.ts
```ts
// src/ulde/types/plugin/ulde-plugin.types.ts

import { ULDEPageContext, ULDERenderContext } from "@ulde/types/context";

// ---------------------------------------------------------
// ULDE Plugin Kinds
// ---------------------------------------------------------

export type ULDEPluginKind =
  | 'content'
  | 'layout'
  | 'interactive'
  | 'navigation'
  | 'demo'
  | 'ulde';

// ---------------------------------------------------------
// ULDE Plugin Definition
// ---------------------------------------------------------

export interface ULDEPlugin {
  pluginKind: ULDEPluginKind;
  pluginName: string;
  version?: string;
  description?: string;
  enabled?: boolean;
  hooks: ULDEPluginHooks;
}

// ---------------------------------------------------------
// ULDE Plugin Hooks
// ---------------------------------------------------------

export interface ULDEPluginHooks {
  onInit?(): void | Promise<void>;
  onPageLoad?(ctx: ULDEPageContext): void | Promise<void>;
  onBeforeRender?(ctx: ULDERenderContext): void | Promise<void>;
  onAfterRender?(ctx: ULDERenderContext): void | Promise<void>;
  onDestroy?(): void | Promise<void>;
}

```

#### 7-7. renderer/

##### 7-7-1. index.ts
```ts
// src/ulde/types/renderer/index.ts

export * from "./ulde-renderer.types";

```

##### 7-7-2. ulde-renderer.types.ts
```ts
// src/ulde/types/renderer/ulde-renderer.types.ts

import { ULDERenderContext } from "@ulde/types/context";
import { ULDEDiagnostic } from "@ulde/types/diagnostic";
import { ULDEFrame } from "@ulde/types/frame";
import { ULDELifecyclePhase } from "@ulde/types/lifecycle";

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
  currentLifecyclePhase?: ULDELifecyclePhase;
  diagnostics?: ULDEDiagnostic[];
  frame?: ULDEFrame;
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

```

#### 7-8. timing/

##### 7-8-1. index.ts
```ts
// src/ulde/types/timing/index.ts

export * from "./ulde-timing.types";

```

##### 7-8-2. ulde-timing.types.ts
```ts
// src/ulde/types/timing/ulde-timing.types.ts

import { ULDEPluginKind, ULDEPluginHooks } from "../plugin/ulde-plugin.types";
import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";

// ---------------------------------------------------------
// ULDE Plugin Timing
// timing of ONE plugin hook execution
// ---------------------------------------------------------

export interface ULDEPluginTiming {
  pluginName: string;
  pluginKind: ULDEPluginKind;
  hookName: keyof ULDEPluginHooks;
  lifecyclePhase: ULDELifecyclePhase;
  duration: number;
}

```

#### 7-9. index.ts
```ts
// src/ulde/types/index.ts

export * from "./context/index";
export * from "./debug/index";
export * from "./diagnostic/index";
export * from "./frame/index";
export * from "./lifecycle/index";
export * from "./plugin/index";
export * from "./renderer/index";
export * from "./timing/index";


```

### 8. src/ulde/viewer/

#### 8-1. index.ts
```ts
// src/ulde/viewer/index.ts

export * from "./ulde-renderer.service";
export * from "./ulde-viewer";

```

#### 8-2. ulde-renderer.service.ts
```ts
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

    // initial placeholder
    config.container.innerHTML = '<p>ULDE Viewer READY</p>';

    function renderFromContext(renderContext: ULDERenderContext | undefined) {
      if (!renderContext) return;
      config.container.innerHTML = renderContext.html;
      bindInteractivity(config.container);
    }

    function renderLifecyclePhase(phase: string | undefined) {
      // optional: could add a data attribute or small badge
      if (!phase) {
        delete config.container.dataset['uldeLifecyclePhase'];
        return;
      }

      config.container.dataset['uldeLifecyclePhase'] = phase;
    }

    function renderDiagnosticsOverlay(diags: ULDEDiagnostic[] | undefined) {

      if (!diags || diags.length === 0) {
        delete config.container.dataset['uldeDiagnosticsCount'];
        return;
      }
      config.container.dataset['uldeDiagnosticsCount'] = String(diags.length);
    }


    function renderFrameInfo(frame: ULDEFrame | undefined) {
      // optional: could add timing info; keep minimal for now
      if (!frame) {
        delete config.container.dataset['uldeFrameId'];
        delete config.container.dataset['uldeFrameTimestamp'];
        return;
      }
      config.container.dataset['uldeFrameId'] = frame.id;
      config.container.dataset['uldeFrameTimestamp'] = String(frame.timestamp);
    }

    function bindInteractivity(container: HTMLElement) {
      // clear previous listeners by resetting innerHTML already done in renderFromContext

      // add event to highlight active section on scroll
      const sections = Array.from(container.querySelectorAll('section'));

      window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        for (const section of sections) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            section.classList.add('active');
          } else {
            section.classList.remove('active');
          }
        }
      });

      // add event to highlight TOC entry for active section
      const tocLinks = Array.from(container.querySelectorAll('.ulde-toc a'));

      window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        tocLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (!href) return;

          const target = container.querySelector(href);
          if (!target) return;

          const rect = target.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      });


      // TOC links: .ulde-toc a[href="#section-id"]
      container.querySelectorAll('.ulde-toc a').forEach(a => {
        a.addEventListener('click', ev => {
          ev.preventDefault();
          const href = (ev.currentTarget as HTMLAnchorElement).getAttribute('href');
          if (!href) return;
          const target = container.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      // Anchors: a[data-ulde-anchor="id"]
      container.querySelectorAll('a[data-ulde-anchor]').forEach(a => {
        a.addEventListener('click', ev => {
          ev.preventDefault();
          const id = (ev.currentTarget as HTMLElement).getAttribute('data-ulde-anchor');
          if (!id) return;
          const target = container.querySelector(`#${id}`);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      // Demo blocks: .ulde-demo[data-demo-code]
      container.querySelectorAll('.ulde-demo').forEach(demo => {
        demo.addEventListener('click', () => {
          const code = demo.getAttribute('data-demo-code');
          if (!code) return;
          try {
            const fn = new Function('console', code);
            fn(console);
            // console.log('[ULDE Demo] Running code:', code);
            // // eslint-disable-next-line no-eval
            // eval(code);
          } catch (err) {
            console.error('[ULDE Demo] Error running code:', err);
          }
        });
      });
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
        delete config.container.dataset['uldeDiagnosticsCount'];
        delete config.container.dataset['uldeFrameId'];
        delete config.container.dataset['uldeFrameTimestamp'];
      }
    };
  }
}

```

#### 8-3. ulde-viewer.html
```html
<!-- src/ulde/viewer/ulde-viewer.html -->

<div class="ulde-viewer">
  <!-- <p>UldeViewer Works</p> -->
  <div #viewerHost class="viewerHost"></div>
</div>

```

#### 8-4. ulde-viewer.scss
```scss
// src/ulde/viewer/ulde-viewer.scss

.ulde-viewer {
  width: 80%;
  height: 85vh;
  display: block;
  padding: 20px;
  background-color: rgba(147, 192, 237, 0.779);
  overflow-y: scroll;
}

```

#### 8-5. ulde-viewer.ts
```ts
// src/ulde/viewer/ulde-viewer.ts

import {
  AfterViewInit,
  OnDestroy,
  Component,
  ElementRef,
  ViewChild,
  effect,
  input,
  output,
} from '@angular/core';
import { ULDEOverlayService } from '@ulde/core';
import type { ULDERendererState } from '@ulde/types/renderer';
import { ULDERendererService } from '@ulde/viewer';
import { isBrowser } from '../../app/global.utils/global.utils';

@Component({
  selector: 'ulde-viewer',
  templateUrl: 'ulde-viewer.html',
  styleUrl: 'ulde-viewer.scss',
})
export class UldeViewer implements AfterViewInit, OnDestroy {
  @ViewChild('viewerHost', { static: true })
  hostRef!: ElementRef<HTMLElement>;

  // Full renderer state comes in as a signal input
  $rendererState = input<ULDERendererState>();

  ready = output<void>();
  error = output<Error>();
  stateChange = output<ULDERendererState>();

  constructor(
    private rendererService: ULDERendererService,
    private overlay: ULDEOverlayService,
  ) {
    // 🔥 React to ULDE lifecycle phases
    effect(() => {
      const phase = this.overlay.currentLifecyclePhaseTiming();
      if (!phase) return;

      this.rendererService.setState({
        currentLifecyclePhase: phase.lifecyclePhase,
      });
    });

    // 🔥 React to diagnostics
    effect(() => {
      const diagnostics = this.overlay.diagnostics();
      if (diagnostics.length < 1) return;

      this.rendererService.setState({ diagnostics });
    });

    // 🔥 React to frame finalization
    effect(() => {
      const frame = this.overlay.currentFrame();
      if (!frame) return;

      this.rendererService.setState({ frame });
    });

    // 🔥 React to rendererState signal input (without re-init)
    effect(() => {
      const s = this.$rendererState();
      if (!s) return;

      this.syncSignalInput();
    });
  }

  ngAfterViewInit(): void {
    if (!isBrowser()) return;

    this.rendererService.init(
      this.hostRef,
      {
        width: this.hostRef.nativeElement.clientWidth,
        height: this.hostRef.nativeElement.clientHeight,
      },
      {
        onReady: () => this.ready.emit(),
        onError: (e) => this.error.emit(e),
        onStateChange: (s) => this.stateChange.emit(s),
      },
    );

    // Push initial state after init
    this.syncSignalInput();
  }

  ngOnDestroy(): void {
    this.rendererService.dispose();
  }

  private syncSignalInput(): void {
    const s = this.$rendererState();
    if (!s) return;

    this.rendererService.setState({
      modelId: s.modelId,
      variantId: s.variantId,
      zoom: s.zoom,
      rotation: s.rotation,
      renderContext: s.renderContext,
    });
  }
}

```

**NOTE: The below is my mmemo**

## 3. Page vs Context vs Meta

Here is the full English translation — clear, natural, and faithful to the original meaning.

---

## **English Translation**

In website structure and data management, *page*, *context*, and *meta* are concepts that each have different roles and layers.  
In short: **a “page” is the visible content itself, “context” is the surrounding situation or environment, and “meta” is the management data that describes them.**

---

## **Comparison of the Three Concepts**

| Concept | Role | Analogy (as a book) | Examples |
|---|---|---|---|
| **Page** | The actual screen or content the user sees | A specific *page* in a book (where text and illustrations appear) | Homepage, article body, product detail page |
| **Context** | The situation or environment in which the page is displayed | The *environment* in which the reader reads the book (a dark room, a café, commuting) | User’s language, login status, location, device |
| **Meta** | Supplementary information that describes the page or data | The *colophon or table of contents* of a book (author, publication date, genre) | Title tag, description, keywords |

---

## **Details of Each Element**

### 📄 **Page**
The digital document that users actually see when they access a URL in their browser.

- **Role:** Deliver text, images, videos, and other content directly to the user.  
- **Characteristics:** Has a unique URL and is composed of HTML.

---

### 🌐 **Context**
The “background,” “situation,” or “user environment” when a page is displayed or when the system operates.

- **Role:** Optimize the content or design of the page depending on the situation.  
- **Characteristics:** Not directly visible on the screen, but used as system decision criteria (e.g., whether the user is on a smartphone, whether they are logged in).

---

### 🏷️ **Meta**
Data about data — attribute information that explains “what the page is.”

- **Role:** Communicate the page’s content accurately to search engines (Google, etc.) and social networks.  
- **Characteristics:** Usually written in the webpage’s source code (inside the `<head>` tag) and used as the title or description in search results.

---
