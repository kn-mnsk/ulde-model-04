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

```

## 2. File contents by the folder structure

### 1. src/ulde/configurator/

#### 1-1. index.ts
```ts
// src/ulde/configurator/index.ts

export * from "./ulde-configurator";

```

#### 1-2. ulde-configurator.html
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

#### 1-3. ulde-configurator.route.ts
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

#### 1-4. ulde-configurator.ts
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

### 2. src/ulde/core/

#### 2-1. debug/

##### 2-1-1. index.ts
```ts
// src/ulde/core/debug/index.ts

export * from "./ulde-debug-tools.service";

```

##### 2-1-2. ulde-debug.tools.service.ts
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
      const total = frame.lifecyclePhases.reduce((sum, p) => sum + p.duration, 0);

      return {
        frameId: frame.id,
        totalDuration: total,
        phases: frame.lifecyclePhases.map(p => ({
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
      f.lifecyclePhases.reduce((sum, p) => sum + p.duration, 0)
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

#### 2-2. overay/

##### 2-2-1. index.ts
```ts
// src/ulde/core/overlay/index.ts

export * from "./ulde-overlay.service";
export * from "./ulde-overlay";

```

##### 2-2-2. ulde-overlay.html
```ts
<!-- src/ulde/core/overlay/ulde-overlay.html -->

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
    @for (p of lifecyclePhases(); track p.lifecyclePhase) {
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
        f.lifecyclePhases.reduce((a, p) => a + p.duration, 0)
        | number:'1.0-1'
        }}ms
      </span>
    </div>
    }
  </section>

</div>

```

##### 2-2-3. ulde-overaly.scss
```ts
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

##### 2-2-4. ulde-overlay.service.ts
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
  lifecyclePhases = signal<ULDELifecyclePhaseTiming[]>([]);
  currentPhase = signal<ULDELifecyclePhaseTiming | null>(null);

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
        const total = f.lifecyclePhases.reduce((a, p) => a + p.duration, 0);
        return `${i * 10},${40 - Math.min(total, 40)}`;
      })
      .join(' ');
  });

  // Derived: filtered plugin timings by lifecycle phase
  filteredPluginTimings = computed(() => {
    const phase = this.currentPhase();
    const timings = this.pluginTimings();

    if (!phase) return timings;
    return timings.filter(t => t.lifecyclePhase === phase.lifecyclePhase);
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
    this.currentPhase.set({
      lifecyclePhase,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
    });
  }

  endPhase(lifecyclePhase: ULDELifecyclePhase) {
    const phase = this.currentPhase();
    if (!phase || phase.lifecyclePhase !== lifecyclePhase) return;

    const end = performance.now();
    const duration = end - phase.startTime;

    const updatedPhase: ULDELifecyclePhaseTiming = {
      ...phase,
      endTime: end,
      duration,
    };

    this.lifecyclePhases.update(list => [...list, updatedPhase]);
    this.currentPhase.set(null);
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
      lifecyclePhases: this.lifecyclePhases(),
      pluginTimings: this.pluginTimings(),
      diagnostics: this.diagnostics()
    };

    this.frames.update(list => [...list.slice(-50), frame]); // keep last 50 frames
    this.currentFrame.set(frame);

    // reset for next frame
    this.lifecyclePhases.set([]);
    this.pluginTimings.set([]);
  }

  // Diagnostics
  addDiagnostic(diag: ULDEDiagnostic) {
    this.diagnostics.update(list => [...list, diag]);
  }
}

```

##### 2-2-5. ulde-overlay.ts
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
  lifecyclePhases!: typeof this.store.lifecyclePhases;
  pluginTimings!: typeof this.store.pluginTimings;
  frameHistory!: typeof this.store.frames;
  diagnostics!: typeof this.store.diagnostics;

  currentPhase!: typeof this.store.currentPhase;
  currentFrame!: typeof this.store.currentFrame;

  sparklinePoints!: typeof this.store.sparklinePoints;
  filteredPluginTimings!: typeof this.store.filteredPluginTimings;

  visible!: typeof this.store.visible;
  pinned!: typeof this.store.pinned;
  opacity!: typeof this.store.opacity;

  thresholds!: typeof this.store.thresholds;

  constructor(private store: ULDEOverlayService) {
    // Assign AFTER DI is ready
    this.lifecyclePhases = store.lifecyclePhases;
    this.pluginTimings = store.pluginTimings;
    this.frameHistory = store.frames;
    this.diagnostics = store.diagnostics;

    this.currentPhase = store.currentPhase;
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
    this.store.currentPhase.set(phase);
  }

  clearPhaseSelection() {
    this.store.currentPhase.set(null);
  }

  // Frame selection (for timeline/sparkline)
  selectFrame(frame: ULDEFrame) {
    this.store.currentFrame.set(frame);
  }
}

```

#### 2-3. index.ts
```ts
// src/ulde/core/index.ts

export * from "./debug/index";
export * from "./overlay/index";
export * from "./ulde-lifecycle.service";
export * from "./ulde-plugin-registry.service";
export * from "./ulde-runtime.service";

```

#### 2-4. ulde-lifecycle.service.ts
```ts
// src/ulde/core/ulde-lifecycle.service.ts

import { Injectable } from '@angular/core';
import { ULDEPluginRegistryService, ULDERuntimeService } from '@ulde/core';
import { ULDEOverlayService } from '@ulde/core/overlay';
import { ULDEPageContext, ULDERenderContext, } from '@ulde/types/context';
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';

@Injectable({ providedIn: 'root' })
export class ULDELifecycleService {

  constructor(
    private overlay: ULDEOverlayService,
    private pluginRegistry: ULDEPluginRegistryService,
    private runtime: ULDERuntimeService,
  ) { }

  startPhase(lifecyclePhase: ULDELifecyclePhase) {
    this.overlay.startPhase(lifecyclePhase);
  }

  endPhase(lifecyclePhase: ULDELifecyclePhase) {
    this.overlay.endPhase(lifecyclePhase);
  }

  async runPhase(
    lifecyclePhase: ULDELifecyclePhase,
    hookName?: keyof ULDEPluginRegistryService['hookMap'],
    ctx?: ULDEPageContext | ULDERenderContext | Record<string, any>,
  ) {
    try {
      this.startPhase(lifecyclePhase);

      if (hookName) {
        await this.pluginRegistry.run(hookName, {
          ...(ctx || {}),
          lifecyclePhase,
        });
      }

      this.endPhase(lifecyclePhase);
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
  async executeLifecycle(
    pageContext: ULDEPageContext,
    renderContextBuilder: () => Promise<ULDERenderContext>,
  ) {
    // INIT
    await this.runPhase('init', 'onInit');

    // LOAD
    await this.runPhase('load', 'onPageLoad', pageContext);

    // RENDER
    const renderContext = await renderContextBuilder();
    await this.runPhase('render', 'onBeforeRender', renderContext);

    // HYDRATE
    await this.runPhase('hydrate', 'onAfterRender', renderContext);

    // AFTER RENDER
    this.startPhase('afterRender');
    this.runtime.finalizeFrameAndAnalyze();
    this.endPhase('afterRender');
  }
}

```

#### 2-5. ulde-plugin-registry.service.ts
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
    // this.plugins.sort((a, b) => a.name.localeCompare(b.name)); // deterministic order
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
          message: `Plugin "${plugin.name}" failed in hook "${hookName}": ${String(err)}`,
          pluginName: plugin.name,
          lifecyclePhase: ctx?.lifecyclePhase,
        });
      }

      const end = performance.now();

      const timing: ULDEPluginTiming = {
        pluginName: plugin.name,
        pluginKind: plugin.pluginKind as ULDEPluginKind,
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
          message: `Plugin "${plugin.name}" failed in onDestroy: ${String(err)}`,
          pluginName: plugin.name,
        });
      }

      const end = performance.now();

      this.overlay.recordPluginTiming({
        pluginName: plugin.name,
        pluginKind: plugin.pluginKind,
        hookName: 'onDestroy',
        lifecyclePhase: 'afterRender',
        duration: end - start,
      });
    }
  }

  /**
   * Get all registered plugins.
   */
  list() {
    return [...this.plugins];
  }
}

```

#### 2-6. ulde-runtime.service.ts
```ts
// src/ulde/core/ulde-runtime.service.ts

import { Injectable } from '@angular/core';
import { ULDEOverlayService } from '@ulde/core';
import { ULDEFrame } from '@ulde/types/frame';

@Injectable({ providedIn: 'root' })
export class ULDERuntimeService {
  // Simple thresholds (tune as needed)
  private phaseWarnThreshold = 12;   // ms
  private phaseErrorThreshold = 24;  // ms
  private pluginWarnThreshold = 8;   // ms
  private pluginErrorThreshold = 16; // ms

  constructor(private overlay: ULDEOverlayService) { }

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
    for (const phase of frame.lifecyclePhases) {
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
}

```

### 3. src/ulde/engine/

#### 3-1. index.ts
```ts
// src/ulde/engine/index.ts

export * from "./ulde-ast-builder.engine";
export * from "./ulde-ast-renderer.engine";
export * from "./ulde-ast-visitor.engine";
export * from "./ulde-content.engine.service";
export * from "./ulde-docs.engine.service";
export * from "./ulde-interactive.engine.service";
export * from "./ulde-layout.engine.service";

```

#### 3-2. ulde-ast-builder.engine.ts
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

      // ---------------------------------------------------------
      // Headings
      // ---------------------------------------------------------
      case 'heading_open':
        open({
          type: 'heading',
          depth: Number(t.tag.substring(1)),
        });
        break;

      case 'heading_close':
        close();
        break;

      // ---------------------------------------------------------
      // Paragraphs
      // ---------------------------------------------------------
      case 'paragraph_open':
        open({ type: 'paragraph' });
        break;

      case 'paragraph_close':
        close();
        break;

      // ---------------------------------------------------------
      // Lists
      // ---------------------------------------------------------
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

      // ---------------------------------------------------------
      // Blockquote
      // ---------------------------------------------------------
      case 'blockquote_open':
        open({ type: 'blockquote' });
        break;

      case 'blockquote_close':
        close();
        break;

      // ---------------------------------------------------------
      // Code blocks
      // ---------------------------------------------------------
      case 'fence':
        push({
          type: 'code',
          lang: t.info || undefined,
          value: t.content,
        });
        break;

      // ---------------------------------------------------------
      // Inline tokens
      // ---------------------------------------------------------
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
          }
        }
        break;

      // ---------------------------------------------------------
      // Ignore everything else for now
      // ---------------------------------------------------------
      default:
        break;
    }
  }

  return root;
}

```

#### 3-3. ulde-ast-renderer.engine.ts
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
      case 'heading':
        buf.push(`<h${node.depth}>`);
        node.children?.forEach(renderNode);
        buf.push(`</h${node.depth}>`);
        break;

      case 'paragraph':
        buf.push('<p>');
        node.children?.forEach(renderNode);
        buf.push('</p>');
        break;

      case 'blockquote':
        buf.push('<blockquote>');
        node.children?.forEach(renderNode);
        buf.push('</blockquote>');
        break;

      case 'list': {
        const ordered = node.meta?.['ordered'] === true;
        buf.push(ordered ? '<ol>' : '<ul>');
        node.children?.forEach(renderNode);
        buf.push(ordered ? '</ol>' : '</ul>');
        break;
      }

      case 'listItem':
        buf.push('<li>');
        node.children?.forEach(renderNode);
        buf.push('</li>');
        break;

      case 'thematicBreak':
        buf.push('<hr />');
        break;

      // ---------------------------------------------------------
      // Inline nodes
      // ---------------------------------------------------------
      case 'text':
        buf.push(escapeHtml(node.value ?? ''));
        break;

      case 'strong':
        buf.push('<strong>');
        node.children?.forEach(renderNode);
        buf.push('</strong>');
        break;

      case 'emphasis':
        buf.push('<em>');
        node.children?.forEach(renderNode);
        buf.push('</em>');
        break;

      case 'inlineCode':
        buf.push('<code>');
        buf.push(escapeHtml(node.value ?? ''));
        buf.push('</code>');
        break;

      case 'break':
        buf.push('<br />');
        break;

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

      case 'math':
        buf.push(`<div class="ulde-math">`);
        buf.push(escapeHtml(node.value ?? ''));
        buf.push('</div>');
        break;

      case 'inlineMath':
        buf.push(`<span class="ulde-math-inline">`);
        buf.push(escapeHtml(node.value ?? ''));
        buf.push('</span>');
        break;

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
        buf.push(`<div class="ulde-demo" data-demo-id="${escapeHtml(id)}">`);
        node.children?.forEach(renderNode);
        buf.push('</div>');
        break;
      }

      case 'toc':
        buf.push('<div class="ulde-toc"></div>');
        break;

      case 'anchor': {
        const id = node.meta?.['id'] ?? '';
        buf.push(`<a id="${escapeHtml(id)}"></a>`);
        break;
      }

      // ---------------------------------------------------------
      // Fallback: render children only
      // ---------------------------------------------------------
      default:
        node.children?.forEach(renderNode);
        break;
    }
  };

  nodes.forEach(renderNode);
  return buf.join('');
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
#### 3-4. ulde-ast-visitor.engine.ts
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

    // ---------------------------------------------------------
    // PRE-VISIT (before children)
    // ---------------------------------------------------------
    if (pre) {
      const result = pre(node, parent);

      if (result === null) {
        return null; // remove node
      }

      if (result && result !== node) {
        node = result; // replace node
      }
    }

    // ---------------------------------------------------------
    // Visit children
    // ---------------------------------------------------------
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

    // ---------------------------------------------------------
    // POST-VISIT (after children)
    // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Walk root array
  // ---------------------------------------------------------
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

#### 3-5. ulde-content.engine.service.ts
```ts
// src/ulde/engine/ulde-content.engine.service.ts

import { inject, Injectable } from '@angular/core';

import { navigate } from '../../app/global.utils/global.utils';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ContentEngineService {

  title = "ContentEngineService";

  async load(pageId: string): Promise<string | undefined> {
    /* existing loader */

    console.log(`Log: ${this.title} load \nid=`, pageId);

    const url = `assets/${pageId}.md`;

    try {
      const response = await fetch(url);

      if (response.redirected) {
        const router = inject(Router);
        navigate(router, ['PageNotFound']);
        throw new Error(`Invalid URL: ${url}`);
      }

      const raw = await response.text();

      return raw;

    } catch (err) {
      console.error('${component} loadAndRender error:', err);
      return undefined;
    }

  }
  transform(docId: string): Promise<any> {
    /* existing parser */


    return new Promise<any>(() => { });

  }
}

```

#### 3-6. ulde-docs.engine.service.ts
```ts
// src/ulde/engine/ulde-docs.engine.service.ts

import { Injectable } from '@angular/core';
import { ULDELifecycleService } from '../core/ulde-lifecycle.service';
import { ULDEPluginRegistryService } from '../core/ulde-plugin-registry.service';
import { ULDERuntimeService } from '../core/ulde-runtime.service';
import { ContentEngineService } from './ulde-content.engine.service';
import { InteractiveEngineService } from './ulde-interactive.engine.service';
import { LayoutEngineService } from './ulde-layout.engine.service';

@Injectable({
  providedIn: 'root',
})
export class DocsEngineService {


  constructor(
    private lifecycle: ULDELifecycleService,
    private content: ContentEngineService,
    private layout: LayoutEngineService,
    private interactive: InteractiveEngineService,
    private pluginRegistry: ULDEPluginRegistryService,
    private runtime: ULDERuntimeService
  ) { }

  async execute(pageId: string) {
    await this.init();          // init → load
    await this.loadPage(pageId); // load → render
    await this.renderPage(pageId); // render → hydrate
    await this.hydratePage(pageId); // hydrate → afterRender
    await this.afterRender();     // finalize frame
  }


  /** INIT Phase — System Boot
   * ULDE overlay shows “init” starting
   * Plugin hooks like onInit() run
   * ULDE records timings
   * No content is loaded yet
   */
  async init() {
    this.lifecycle.startPhase("init");
    await this.pluginRegistry.run("onInit", { phase: 'init' });
    this.lifecycle.endPhase("init");
  }

  /** LOAD Phase — Fetch Content + Layout
   * Markdown/MDX/raw content is loaded
   * Layout metadata is prepared
   * Plugins like content.frontmatter-normalizer run
   * ULDE overlay shows load duration
   * @param pageId
   */
  private async loadPage(pageId: string) {
    this.lifecycle.startPhase("load");
    const raw = await this.content.load(pageId);
    if (raw === undefined) throw new Error(`Invalid URL`);
    const layout = await this.layout.prepare(pageId);
    await this.pluginRegistry.run("onPageLoad", {
      phase: "load",
      pageId,
      rawContent: raw,
      layout
    });
    this.lifecycle.endPhase("load");
  }

  /** RENDER Phase - Transform + Layout
   * AST is generated
   * HTML is produced
   * Layout plugins (TOC, callouts, codeblock enhancers) run
   * ULDE overlay shows render timings
   * @param pageId
   */
  private async renderPage(pageId: string) {
    this.lifecycle.startPhase("render");

    const ast = await this.content.transform(pageId);
    const html = await this.layout.render(ast);

    await this.pluginRegistry.run("onBeforeRender", {
      phase: "render",
      pageId,
      ast,
      html
    });

    this.lifecycle.endPhase("render");
  }

  /** HYDRATE Phase — Activate Interactive Components
   * Angular components mount inside rendered HTML
   * Demo plugins (playgrounds, sandboxes) hydrate
   * ULDE overlay shows hydration timings
   * @param pageId
   */
  private async hydratePage(pageId: string) {
    this.lifecycle.startPhase("hydrate");

    await this.interactive.hydrate(pageId);
    await this.pluginRegistry.run("onAfterRender", {
      phase: "hydrate",
      pageId
    });

    this.lifecycle.endPhase("hydrate");
  }

  /** AFTER RENDER Phase — Finalize Frame + Overlay Update
   * ULDE runtime finalizes the frame
   * Overlay sparkline updates
   * Heatmap + timeline diagnostics run
   * Warnings appear if needed
   * @param pageId
   */
  private async afterRender() {

    this.lifecycle.startPhase("afterRender");

    this.runtime.finalizeFrameAndAnalyze(); // overlay + diagnostic

    this.lifecycle.endPhase("afterRender");

  }

}

```

#### 3-7. ulde-interactive.engine.service.ts
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

#### 3-8. ulde-layout.engine.service.ts
```ts
// src/ulde/engine/ulde-layout.engine.service.ts

import { Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class LayoutEngineService {

  prepare(pageId: string): any {
    /* choose layout, gather metadata */

    const layout: any = {};

    return layout;
  }

  render(astOrHtml: any): string | SafeHtml {
    /* apply layout */

    const html: String | SafeHtml = {};

    return html;

   }
}

```

### 4. src/ulde/plugins/

#### 4-1. contributor/

Maybe for the future

#### 4-2. registry/

##### 4-2-1. index.ts
```ts
// src/ulde/plugins/registry/index.ts

export * from './ulde-plugin-registry';

```

##### 4-2-2. ulde-plugin-registry.ts
```ts
// src/ulde/plugins/registry/ulde-plugin-registry.ts

/**
 * ULDE older version
 * Those phases to be changed to ULDEPlugingKind
 *
 * This registry returns ONLY ULDE pipeline plugins:
 *   - CONTENT phase
 *   - TRANSFORM phase
 *   - DIAGNOSTICS phase
 *   - ASSEMBLE phase
 *
 * Browser DOM plugins (Mermaid, KaTeX auto-render, Anchors, ScrollSpy)
 * are NOT included here — they are registered in UldeBrowserHost.
 */


// ------------------------------
// content PLUGINS
// ------------------------------
import { CodeBlockEnhancer } from '@ulde/plugins/system/content';
import { FrontmatterNormalizer } from '@ulde/plugins/system/content';

// ------------------------------
// Layout PLUGINS
// ------------------------------
import { AutoTOC } from '@ulde/plugins/system/layout';

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


// -----------------------------------------------------
// BUILD REGISTRY (ORDER MATTERS) - String World
// -----------------------------------------------------
export function createUldeStringPluginRegistry() {
  return [
    // Content PHASE
    CodeBlockEnhancer,
    FrontmatterNormalizer,

    // Layout PHASE
    AutoTOC,

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

#### 4-3. system/

##### 4-3-1. content/

###### 4-3-1-1. index.ts
```ts
// src/ulde/plugins/system/content/index.ts

export * from "./ulde-codeblock.plugin";
export * from "./ulde-frontmatter-normalizer.plugin";

```

###### 4-3-1-2. ulde-codeblock.plugin.ts
```ts
// src/ulde/plugins/system/content/ulde-codeblock.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";

export const CodeBlockEnhancer: ULDEPlugin = {
  pluginKind: 'content',
  name: "CodeblockEnhancer",
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

###### 4-3-1-3. ulde-frontmatter-normalizer.plugin.ts
```ts
// src/ulde/plugins/system/content/ulde-frontmatter-normalizer.plugin.ts

import { ULDEPlugin } from '@ulde/types/plugin';

export const FrontmatterNormalizer: ULDEPlugin = {
  pluginKind: 'content',
  name: "FrontmatterNormalizer",
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

##### 4-3-2. demo/

###### 4-3-2-1. index.ts
```ts
// src/ulde/plugins/system/demo/index.ts

export * from "./ulde-playground-injector.plugin";

```

###### 4-3-2-2. ulde-playground-injector.plugin.ts
```ts
// src/ulde/plugins/system/demo/ulde-playground-injector.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";

import { createComponent, EnvironmentInjector } from "@angular/core";
import { Example01 } from "../../../../app/babylon/example01/example01";

export const PlaygroundInjector: ULDEPlugin = {
  pluginKind: 'demo',
  name: "PlaygroundInjector",
  description: "Hydrates <demo-playground> blocks into live Angular components",
  enabled: true,
  hooks: {
    async onAfterRender(ctx) {
      const placeholders = document.querySelectorAll("demo-playground");
     // You must provide the Angular environment injector
      const injector = (window as any).ngEnvironment as EnvironmentInjector;

      for (const el of placeholders) {
        const cmpRef = createComponent(Example01, {
          hostElement: el,
          environmentInjector: injector
        });

        cmpRef.changeDetectorRef.detectChanges();
      }
    }
  }
};

```

##### 4-3-3. interactive/

###### 4-3-3-1. index.ts
```ts
// src/ulde/plugins/system/interactive/index.ts

export * from "./ulde-dummy-test.plugin";

```

###### 4-3-3-2. ulde-dummy-test.plugin.ts
```ts
// src/ulde/plugins/system/interactive/ulde-dummy-test.plugin.ts


import { ULDERenderContext } from '@ulde/types/context';
import { ULDEPlugin } from '@ulde/types/plugin';

export function createDummyTestPlugin(): ULDEPlugin {
  return {
    pluginKind: 'content',
    name: 'DummyTestPlugin',
    version: '0.0.1',
    description: 'create dummy test plugin',
    enabled: true,
    hooks: {

      onBeforeRender(ctx: ULDERenderContext) {
        const { frame } = ctx;

        /**
         * To ne coded
         */


      },
    }
  };
}

```

##### 4-3-4. layout/

###### 4-3-4-1. index.ts
```ts
// src/ulde/plugins/system/layout/index.ts

export * from "./ulde-toc.plugin";

```

###### 4-3-4-2. ulde-toc.plugin.ts
```ts
// src/ulde/plugins/system/layout/ulde-toc.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";
import { ULDERenderContext } from "@ulde/types/context";

export const AutoTOC: ULDEPlugin = {
  pluginKind: 'layout',
  name: "AutoTOC",
  description: "Generates a table of contents from headings",
  enabled: true,
  hooks: {
    async onBeforeRender(ctx: ULDERenderContext) {
      const headings = ctx.ast.map(n =>
        n.children?.filter((n: any) => /^h[1-6]$/.test(n.tag))
      );
      const tocHtml = headings
        .map((h: any) => `<li><a href="#${h.id}">${h.text}</a></li>`)
        .join("");

      ctx.html = `<nav class="toc"><ul>${tocHtml}</ul></nav>` + ctx.html;
    }
  }
};


```

##### 4-3-5. navigation/

###### 4-3-5-1. index.ts
```ts
// src/ulde/plugins/system/navigation/index.ts

export * from "./ulde-navigation-breadcrumbs.plugin";

```

###### 4-3-5-2. ulde-navigation-breadcrumbs.plugin.ts
```ts
// src/ulde/plugins/system/navigation/ulde-navigation-breadcrumbs.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";

export const Breadcrumbs: ULDEPlugin = {
  pluginKind: 'navigation',
  name: "Breadcrumbs",
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

##### 4-3-6. ulde/

###### 4-3-6-1. index.ts
```ts
// src/ulde/plugins/system/ulde/index.ts

export * from "./ulde-overlay-custom-panel.plugin";
export * from './ulde-slow-plugin-detector.plugin'
export * from './ulde-timeline-profiler.plugin'

```

###### 4-3-6-2. ulde-overlay-custom-panel.plugin.ts
```ts
// src/ulde/plugins/system/ulde/ulde-overlay-custom-panel.plugin.ts

import { ULDEPlugin } from "@ulde/types//plugin";

export const OverlayCustomPanel: ULDEPlugin = {
  pluginKind: 'ulde',
  name: "OverlayCustomPanel",
  description: "Adds a custom panel to the ULDE overlay",
  enabled: true,
  hooks: {
    onInit() {
      const panel = document.createElement("div");
      panel.className = "ulde-custom-panel";
      panel.innerHTML = "<strong>Custom ULDE Panel</strong>";
      document.body.appendChild(panel);
    }
  }
};

```

###### 4-3-6-3. ulde-slow-plugin-detector.plugin.ts
```ts
// src/ulde/plugins/system/ulde/ulde-slow-pluging-detector.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";
import { ULDEPluginTiming } from "@ulde/types/timing";

export const SlowPluginDetector: ULDEPlugin = {
  pluginKind: 'ulde',
  name: "SlowPluginDetector",
  description: "Warns when plugin execution exceeds threshold",
  enabled: true,
  hooks: {
    async onAfterRender(ctx) {
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

###### 4-3-6-4. ulde-timeline-profiler.plugin.ts
```ts
// src/ulde/plugins/system/ulde/ulde-timeline-profiler.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";

export const TimelineProfiler: ULDEPlugin = {
  pluginKind: 'ulde',
  name: "TimelineProfiler",
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

##### 4-3-7. index.ts
```ts
// src/ulde/plugins/system/index.ts

export * from "./content/index";
export * from "./demo/index";
export * from "./interactive/index";
export * from "./layout/index";
export * from "./navigation/index";
export * from "./ulde/index";

```

#### 4-4. index.ts
```ts
// src/ulde/plugins/index.ts

export * from "./registry/index";
export * from "./system/index";

```

### 5. src/ulde/tools/

Maybe for the future

### 6. src/ulde/types/

#### 6-1. context/

##### 6-1-1. index.ts

```ts
// src/ulde/types/context/index.ts

export * from "./ulde-context.types";

```

##### 6-1-2. udel-context.types.ts
```ts
// src/ulde/types/context/ulde-context.types.ts

import type Token from 'markdown-it';
import { ULDEFrame } from "@ulde/types/frame";
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
  frame: ULDEFrame;
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
    level: 'warning' | 'error';
    message: string;
    code?: string;
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

#### 6-2. debug/

##### 6-2-1. index.ts
```ts
// src/ulde/types/debug/index.ts

export * from "./ulde-debug.types";

```

##### 6-2-2. ulde-debug.types.ts
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

#### 6-3. diagnostic/

##### 6-3-1. index.ts
```ts
// src/ulde/types/diagnostic/index.ts

export * from "./ulde-diagnostic.types";


```

##### 6-3-2. ulde-diagnostic.types.ts
```ts
// src/ulde/types/diagnostic/ulde-diagnostic.types.ts

import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";

// ---------------------------------------------------------
// ULDE Diagnostics
// ---------------------------------------------------------

export interface ULDEDiagnostic {
  level: 'info' | 'warn' | 'error';
  message: string;
  lifecyclePhase?: ULDELifecyclePhase;
  pluginName?: string;
}

```

#### 6-4. frame/

##### 6-4-1. index.ts
```ts
// src/ulde/types/frame/index.ts

export * from "./ulde-frame.types";

```

##### 6-4-2. ulde-frame.types.ts
```ts
// src/ulde/types/frame/ulde-frame.types.ts

import { ULDEDiagnostic } from "@ulde/types/diagnostic";
import { ULDELifecyclePhaseTiming } from "@ulde/types/lifecycle";
import { ULDEPluginTiming } from "@ulde/types/timing";

// ---------------------------------------------------------
// ULDE Frame
// ---------------------------------------------------------

export interface ULDEFrame {
  id: string;
  timestamp: number;
  lifecyclePhases: ULDELifecyclePhaseTiming[];
  pluginTimings: ULDEPluginTiming[];
  diagnostics: ULDEDiagnostic[] //warning or error generated by ULDE
}

```

#### 6-5. lifecycle/

##### 6-5-1. index.ts
```ts
// src/ulde/types/lifecycle/index.ts

export * from "./ulde-lifecycle.types";

```

##### 6-5-2. ulde-lifecycle.types.ts
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

#### 6-6. plugin/

##### 6-6-1. index.ts
```ts
// src/ulde/types/plugin/index.ts

export * from "./ulde-plugin.types";

```

##### 6-6-2. ulde-plugin.types.ts
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
  name: string;
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

#### 6-7. renderer/

##### 6-7-1. index.ts
```ts
// src/ulde/types/renderer/index.ts

export * from "./ulde-renderer.types";

```

##### 6-7-2. ulde-renderer.types.ts
```ts
// src/ulde/types/renderer/ulde-renderer.types.ts

export interface ULDERendererConfig {
  container: HTMLElement;
  width: number;
  height: number;
  backgroundColor?: string;
}

export interface ULDERendererState {
  modelId: string;
  variantId?: string;
  zoom: number;
  rotation: { x: number; y: number; z: number };
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

#### 6-8. timing/

##### 6-8-1. index.ts
```ts
// src/ulde/types/timing/index.ts

export * from "./ulde-timing.types";

```

##### 6-8-2. ulde-timing.types.ts
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

#### 6-9. index.ts
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

### 7. src/ulde/viewer/

#### 7-1. index.ts
```ts
// src/ulde/viewer/index.ts

export * from "./ulde-renderer.service";
export * from "./ulde-viewer";

```

#### 7-2. ulde-renderer.service.ts
```ts
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

```

#### 7-3. ulde-viewer.html
```ts
<!-- src/ulde/viewer/ulde-viewer.html -->

<div class="ulde-viewer">
  <p>UldeViewer Works</p>
  <div #canvasHost class="canvas-host"></div>`
</div>

```

#### 7-4. ulde-viewer.scss
```ts
// src/ulde/viewer/ulde-viewer.scss

.ulde-viewer {
  width: 80%;
  height: 80%;
  display: block;
  background-color: red;
}

```

#### 7-5. ulde-viewer.ts
```ts
// src/ulde/viewer/ulde-viewer.ts

import { Component, ElementRef, ViewChild, input, output } from '@angular/core';
import type { AfterViewInit, OnDestroy, } from '@angular/core';
import { ULDERendererService } from '@ulde/viewer';
import type { ULDERendererState } from '@ulde/types/renderer';

@Component({
  selector: 'ulde-viewer',
  templateUrl: `ulde-viewer.html`,
  styleUrl: 'ulde-viewer.scss'
})
export class UldeViewer implements AfterViewInit, OnDestroy {
  @ViewChild('canvasHost', { static: true })
  hostRef!: ElementRef<HTMLElement>;

  modelId = input<string>();
  variantId = input<string>();
  zoom = input<number>(1);
  rotation = input<ULDERendererState['rotation']>({ x: 0, y: 0, z: 0 });

  ready = output<void>();
  error = output<Error>();
  stateChange = output<ULDERendererState>();

  constructor(private rendererService: ULDERendererService) { }

  ngAfterViewInit(): void {
    this.rendererService.init(
      this.hostRef,
      {
        width: this.hostRef.nativeElement.clientWidth,
        height: this.hostRef.nativeElement.clientHeight
      },
      {
        onReady: () => this.ready.emit(),
        onError: (e) => this.error.emit(e),
        onStateChange: (s) => this.stateChange.emit(s)
      }
    );

    this.syncInputs();
  }

  ngOnDestroy(): void {
    this.rendererService.dispose();
  }

  ngOnChanges(): void {
    this.syncInputs();
  }

  private syncInputs() {
    this.rendererService.setState({
      modelId: this.modelId(),
      variantId: this.variantId(),
      zoom: this.zoom(),
      rotation: this.rotation()
    });
  }
}

```
