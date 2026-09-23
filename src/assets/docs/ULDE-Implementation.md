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
      devtools/
        panels/
          /diagnostics
            index.ts
            ulde-devtools-diagnostics.panel.html
            ulde-devtools-diagnostics.panel.scss
            ulde-devtools-diagnostics.panel.ts
          /frame-timeline
            index.ts
            ulde-devtools-frame-timeline.panel.html
            ulde-devtools-frame-timeline.panel.scss
            ulde-devtools-frame-timeline.panel.ts
          /plugin-timeline
            index.ts
            ulde-devtools-plugin-timeline.panel.html
            ulde-devtools-plugin-timeline.panel.scss
            ulde-devtools-plugin-timeline.panel.ts
          /runtime-inspector
            index.ts
            ulde-devtools-runtime-inspector.panel.html
            ulde-devtools-runtime-inspector.panel.scss
            ulde-devtools-runtime-inspector.panel.ts
          index.ts
        index.ts
        ulde-devtools.html
        ulde-devtools.scss
        ulde-overlay.service.ts
        ulde-devtools.ts
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
      adaptor/
        index.ts
        ulde-plugin-hook-adaptor.ts
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
      devtools/
        index.ts
        ulde-devtools.types.ts
      diagnostics/
        index.ts
        ulde-diagnostics.types.ts
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
      styles/
        ulde-viewer-base.scss
        ulde-viewer-components.scss
        ulde-viewer-theme-dark.scss
        ulde-viewer-theme-light.scss
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
<ulde-viewer class="ulde-viewer-host" #HostUldeViewerRef [$rendererState]="$rendererState()"
  ($stateChange)="onViewerStateChange($event)" ($error)="onError($event)">
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

import { AfterViewInit, Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';

import { ULDELifecycleService } from '@ulde/core';
import { ULDEPageContext, ULDERenderContext } from '@ulde/types/context';

import { ContentEngineService } from '@ulde/engine';
import { ULDERendererState } from '@ulde/types/renderer/ulde-renderer.types';
import { UldeViewer } from '@ulde/viewer';
import { isBrowser } from '../../global.utils/global.utils';



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

<!-- <p>App Works!</p> -->
<!-- <ulde-configurator></ulde-configurator> -->
<app-ulde-demo-01></app-ulde-demo-01>

```

#### 1-5. app.routes.ts
```ts
// src/app/app.routes.ts

import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./app')
        .then(m => m.App)
  },
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

```

#### 1-6. app.scss

None


#### 1-7. app.ts
```ts
// src/app/app.ts

import { Component, signal } from '@angular/core';
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

#### 3-1. devtools/

##### 3-1-1. panels/diagnostics/

###### 3-1-1-1. index.ts
```ts
// src/ulde/core/devtools/panels/diagnostics/index.ts

export * from "./ulde-devtools-diagnostics.panel";

```

###### 3-1-1-2. ulde-devtools-diagnostics.panel.html
```html
<!-- src/ulde/core/devtools/panels/diagnostics/ulde-devtools-diagnostics.panel.html -->

<!-- <p>ulde-diagnostics-panel works!</p> -->

<div #diagnosticHost class="ulde-diagnostics-panel-root" [class.collapsed]="!$expanded()">

  <div class="header" (click)="toggle()">
    <span>Diagnostics ({{ $diagnostics().length }})</span>
    <span class="chevron">{{ $expanded() ? '▼' : '▲' }}</span>
  </div>

  @if ($expanded()) {
    <div class="body">
      @for (d of $diagnostics(); track trackDiag($index, d)) {
        <div class="diag-item diag-{{ d.level }}" (click)="onHighlight(d.message)">
          <strong>{{ d.level.toUpperCase() }}</strong>
          <span class="msg">{{ d.message }}</span>

          @if (d.pluginName) {
            <span class="meta">plugin: {{ d.pluginName }}</span>
          }

          @if (d.lifecyclePhase) {
            <span class="meta">phase: {{ d.lifecyclePhase }}</span>
          }
        </div>
      }
    </div>
  }
</div>

```

###### 3-1-1-3. ulde-devtools-diagnostics.panel.scss
```scss
// src/ulde/core/devtools/panels/diagnostics/ulde-devtools-diagnostics.panel.scss

.ulde-diagnostics-panel-root {
  // position: fixed;
  display:flex;
  bottom: 1rem;
  right: 1rem;
  width: 320px;
  background: var(--ulde-bg);
  color: var(--ulde-text);
  border: 1px solid var(--ulde-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 0.9rem;
  z-index: 9999;
}

.ulde-diagnostics-panel.collapsed {
  height: auto;
}

.header {
  padding: 0.75rem 1rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 1px solid var(--ulde-border);
  display: flex;
  justify-content: space-between;
}

.body {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem 1rem;
}

.diag-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--ulde-border);
}

.diag-item:last-child {
  border-bottom: none;
}

.diag-info {
  color: var(--ulde-diagnostic-info);
}

.diag-warn {
  color: var(--ulde-diagnostic-warn);
}

.diag-error {
  color: var(--ulde-diagnostic-error);
}

.msg {
  display: block;
  margin: 0.25rem 0;
}

.meta {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-right: 0.5rem;
}


.highlight {
  background: rgba(255, 255, 0, 0.3);
  transition: background 0.5s ease;
}

/* Define diagnostics injected into AST */
.ulde-diagnostic {
  padding: 0.75rem;
  margin: 1rem 0;
  border-radius: 4px;
  font-size: 0.9rem;
}

.ulde-diagnostic-info {
  background: rgba(0, 120, 212, 0.1);
  border-left: 4px solid var(--ulde-diagnostic-info);
}

.ulde-diagnostic-warn {
  background: rgba(230, 161, 0, 0.1);
  border-left: 4px solid var(--ulde-diagnostic-warn);
}

.ulde-diagnostic-error {
  background: rgba(216, 59, 1, 0.1);
  border-left: 4px solid var(--ulde-diagnostic-error);
}

.ulde-diagnostic strong {
  font-weight: 600;
}

```

###### 3-1-1-3. ulde-devtools-diagnostics.panel.ts
```ts
// src/ulde/core/devtools/panels/diagnostics/ulde-devtools-diagnostics.panel.ts

import { Component, input, signal, ViewChild, ElementRef } from '@angular/core';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';

@Component({
  selector: 'ulde-devtools-diagnostics-panel',
  standalone: true,
  templateUrl: './ulde-devtools-diagnostics.panel.html',
  styleUrl: './ulde-devtools-diagnostics.panel.scss',
})
export class UldeDevToolsDiagnosticsPanel {

  @ViewChild('diagnosticsHost', { static: true })
  hostRef!: ElementRef<HTMLElement>;

  $diagnostics = input<ULDEDiagnostic[]>([]);
  // $highlight = output<string>();

  $expanded = signal(true);

  toggle() {
    this.$expanded.update(v => !v);
  }

  trackDiag(i: number, d: ULDEDiagnostic) {
    return `${d.level}-${d.message}-${i}`;
  }

  onHighlight(msg: string) {
    const nodes = this.hostRef.nativeElement.querySelectorAll('.body .ulde-item .msg');

    nodes.forEach(n => {
      if (n.textContent?.includes(msg)) {
        n.classList.add('ulde-diagnostic-highlight');

        setTimeout(() => {
          n.classList.remove('ulde-diagnostic-highlight');
        }, 1500);
      }
    });
  }


}

```

##### 3-1-2. panels/frame-timeline/

###### 3-1-2-1. index.ts
```ts
// src/ulde/code/devtools/panels/frame-timeline/index.ts

export * from './ulde-devtools-frame-timeline.panel';

```

###### 3-1-2-2. ulde-devtools-frame-timeline.panel.html
```html
<<!-- src/ulde/core/devtools/panels/frame-timeline/ulde-devtools-frame-timeline.panel.html -->

<!-- <p>ulde-devtools-frame-timeline-panel works!</p> -->

<div class="ulde-frame-timeline-panel-root">
  <div class="header">
    <span>Frame Execution Timeline Panel</span>
  </div>
  @if($timelines().length > 0 ){
  <div class="timelines">
    @for(t of $timelines(); track t.frameId){
    <div class="timeline">
      <div class="timeline-header">
        <div class="item">
          <span>Frame id: </span><span>{{ t.frameId}}</span>
        </div>
        <div class="item">
          <span>Timestamp: </span><span>{{ t.timeStamp | date:'full'}}</span>
        </div>
        <div class="item">
          <span>Total duration: </span><span>{{t.totalDuration.toFixed(3)}} ms</span>
        </div>

      </div>

      <div class="timeline-bar">
        @for (p of t.phases; track p.lifecyclePhase) {
        <div class="segment" [style.width.%]="(p.duration/t.totalDuration) * 100"
          [style.background]="phaseColor(p.lifecyclePhase)" [title]="p.lifecyclePhase + ': ' + p.duration + ' ms'">
        </div>
        }

      </div>

      <div class="legend">
        @for (p of t.phases; track p.lifecyclePhase) {
        <div class="legend-item" [class.warn]="p.duration > $thresholds().phaseWarn"
          [class.error]="p.duration > $thresholds().phaseError">
          <span class="color" [style.background]="phaseColor(p.lifecyclePhase)"></span>
          <span class="name">{{ p.lifecyclePhase }}</span>
          <span class="duration">{{ p.duration.toFixed(3) }} ms</span>
        </div>
        }
      </div>
    </div>
    }
  </div>
  }
</div>

```

###### 3-1-2-3. ulde-devtools-frame-timeline.panel.scss
```scss
//src/ulde/core/devtools/panels/frame-timeline/ulde-devtools-frame-timeline.panel.scss

.ulde-frame-timeline-panel-root {
  // display: flex;
  // background: var(--ulde-bg);
  border: 1px solid var(--ulde-border);
  border-radius: 6px;
  padding: 1rem;
  // height: fit-content;
  // width: fit-content;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.header {
  margin-bottom: 1rem;
  font-weight: 800;
}

.timelines {
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.timeline {
  border: 1px solid var(--ulde-border);
}

.timeline-header {
  display: grid;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 600;

  .item {
    display: grid;
    flex-direction: row;
    grid-template-columns: 1fr 3fr ;
  }
}

.timeline-bar {
  width: 90%;
  // border: 20px;
  align-items: center;
  // overflow: fobidden;
  // border-radius: 3px;
  margin-bottom: 0.75rem;

  .segment {
    // width: 100%;
    display: inline-flex;
    height: 5px; // 100%;
    transition: width 0.1s linear;
  }

}

.legend {
  height: 120px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 4px;
  background: #333;
  border-right: 1px solid #444;
  cursor: pointer;
  transition: background 0.2s;
  // overflow: auto;

  .legend-item {
    display: flex;
    align-items: end;
    // width: 30px;
    gap: 0.5rem;

    &.warn {
      background: #7a5f00;
    }

    &.error {
      background: #7a0000;
    }

    .color {
      width: 12px;
      height: 15px;
      border-radius: 3px;
    }

    .name,
    .duration {
      width: 100px;
      height: 20px;
      text-align: left;
    }

  }

}

```

###### 3-1-2-4. ulde-devtools-frame-timeline.panel.ts
```ts
// src/ulde/core/devtools/panels/frame-timeline/ulde-devtools-frame-timeline.panel.ts

import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ULDELifecyclePhase, ULDETimelinePoint } from '@ulde/types';

@Component({
  selector: 'ulde-devtools-frame-timeline-panel',
  imports: [DatePipe],
  templateUrl: './ulde-devtools-frame-timeline.panel.html',
  styleUrl: './ulde-devtools-frame-timeline.panel.scss',
})
export class UldeDevtoolsFrameTimelinePanel {

  $thresholds = input<any>();

  $timelines = input<ULDETimelinePoint[]>([]);


  phaseColor(phase: ULDELifecyclePhase) {
    switch (phase) {
      case 'init': return '#607d8b';
      case 'load': return '#03a9f4';
      case 'render': return '#4caf50';
      case 'hydrate': return '#9c27b0';
      case 'afterRender': return '#9e9e9e';
      default: return '#cccccc';
    }
  }
}

```

##### 3-1-3. panels/plugin-timeline/

###### 3-1-3-1. index.ts
```ts
// src/ulde/core/devtools/panels/plugin-timeline/index.ts

export * from './ulde-devtools-plugin-timeline.panel';

```

###### 3-1-3-2. ulde-devtools-plugin-timeline.panel.html
```ts
<!-- src/ulde/core/devtools/panels/plugin-timeline/ulde-devtools-plugin-timeline.panel.html -->

<!-- <p>ulde-plugin-timeline-panel works!</p> -->

<div class="ulde-plugin-timeline-panel-root">

  <div class="header">
    <span><strong>Plugin Execution Timeline Panel</strong></span>
    <span>{{ $pluginTimings().length }} plugins</span>
    <span>total duration: {{total.toFixed(3)}} ms</span>
  </div>

  <div class="rows">
    @if($pluginTimings().length > 0){

    @for (p of plugins(); track p.label) {
    <div class="row">
      <div class="color" [style.background]="p.color"></div>
      <div class="kind">{{p.kind}} </div>
      <div class="label">{{ p.label }}</div>
      <div class="phase">{{p.phase}}</div>
      <div class="duration" [style.color]="p.color">
        {{ p.duration.toFixed(3) }} ms
      </div>
      <div class="bar-container">
        <div class="bar" [style.width.%]="p.ratio * 100" [style.background]="p.color">
        </div>
      </div>

    </div>
    }
    }
  </div>

</div>

```

###### 3-1-3-3. ulde-devtools-plugin-timeline.panel.scss
```scss
// src/ulde/core/devtools/panels/plugin-timeline/ulde-devtools-plugin-timeline.panel.scss

.ulde-plugin-timeline-panel-root {
  border: 1px solid var(--ulde-border);
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  overflow: auto;

}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.rows {
  display: flex;
  height: 350px;
  flex-direction: column;
  gap: 0.5rem;
  overflow: auto;
}

.row {
  padding-left:5px;
  padding-right:5px;
  width: 95%;
  display: grid;
  flex-direction: row;
  align-items: center;
  border: 1px solid var(--ulde-border);
  grid-template-columns: 0.05fr 0.3fr 0.6fr 0.3fr 0.3fr 0.3fr;

  font-size: 0.8rem;
}

.kind,
.phase,
.label,
.duraion {
  height: 20px;
  padding-left: 3px;
  text-wrap: wrap;
  text-align: left;

}

.color {
  height: 12px;
  border-radius: 3px;
}


.duration {
  font-weight: bold;
}

.bar-container {
  background: var(--ulde-border);
  width: 100px;
  height: 12px;
  border-radius: 3px;

  .bar {
    border-radius: 3px;
    height: 100%;
    transition: width 0.15s ease-out;
  }

}

```

###### 3-1-3-4. ulde-devtools-plugin-timeline.panel.ts
```ts
// src/ulde/core/devtools/panels/plugin-timeline/ulde-devtools-plugin-timeline.panel.ts

import { Component, computed, input } from '@angular/core';
import { ULDEPluginKind } from '@ulde/types/plugin';
import { ULDEPluginTiming } from '@ulde/types/timing';

@Component({
  selector: 'ulde-devtools-plugin-timeline-panel',
  imports: [],
  templateUrl: './ulde-devtools-plugin-timeline.panel.html',
  styleUrl: './ulde-devtools-plugin-timeline.panel.scss',
})
export class UldeDevtoolsPluginTimelinePanel {

  total: number = 0;

  $pluginTimings = input<ULDEPluginTiming[]>([]);


  plugins = computed(() => {
    const list = this.$pluginTimings() ?? [];
    if (list.length === 0) return [];

    this.total = list.reduce((sum, p) => sum + p.duration, 0) || 1;

    return list
      .slice()
      .sort((a, b) => b.duration - a.duration)
      .map(p => ({
        label: `${p.pluginName} (${p.hookName})`,
        duration: p.duration,
        ratio: p.duration / this.total,
        color: pluginColor(p.pluginKind),
        phase: p.lifecyclePhase,
        kind: p.pluginKind,
      }));
  });
}

function pluginColor(kind: ULDEPluginKind) {
  switch (kind) {
    // switch (kind) {
    case 'content': return '#4caf50';
    case 'layout': return '#2196f3';
    case 'interactive': return '#ff9800';
    case 'navigation': return '#9c27b0';
    case 'demo': return '#e91e63';
    case 'ulde': return '#9e9e9e';
    default: return '#cccccc';
  }
}

```


##### 3-1-4. panels/runtime-inspector/

###### 3-1-4-1. index.ts
```ts
// src/ulde/core/devtools/panels/runtime-inspector/index.ts

export * from './ulde-devtools-runtime-inspector.panel';

```

###### 3-1-4-2. ulde-devtools-runtime-inspector.panel.html
```html
<!-- src/ulde/core/devtools/panels/runtime-inspector/ulde-devtools-runtime-inspector.panel.html -->

<p>ulde-runtime-inspector-panel works!</p>

<div class="devtools-runtime-inspector-panel-root">

  <div class="header">
    <span><strong>Runtime Inspector Panel</strong></span>
    <span class="meta">model: {{ $rendererState()?.modelId }}</span>
    <span class="meta">variant: {{ $rendererState()?.variantId }}</span>
  </div>

  @if($rendererState()){

  <div class="tabs">
    <button class="tab" [class.active]="$activeTab() === 'ast'" (click)="setTab('ast')">AST</button>
    <button class="tab" [class.active]="$activeTab() === 'layout'" (click)="setTab('layout')">Layout</button>
    <button class="tab" [class.active]="$activeTab() === 'sections'" (click)="setTab('sections')">Sections</button>
    <button class="tab" [class.active]="$activeTab() === 'toc'" (click)="setTab('toc')">TOC</button>
    <button class="tab" [class.active]="$activeTab() === 'anchors'" (click)="setTab('anchors')">Anchors</button>
    <!-- <button class="tab" [class.active]="$activeTab() === 'frame'" (click)="setTab('frame')">Frame</button> -->
  </div>

  <div class="body">

    @if ($activeTab() === 'ast') {
    <pre class="json-view">{{ $astNodes() | json }}</pre>
    }

    @if ($activeTab() === 'layout') {
    <pre class="json-view">{{ $layout() | json }}</pre>
    }

    @if ($activeTab() === 'sections') {
    <ul class="list-view">
      @for (s of $sections(); track track($index)) {
      <li>
        <code>{{ s.id }}</code>
        <!-- <span class="title">{{ s.title }}</span> -->
        <span class="depth">depth: {{ s.depth }}</span>
      </li>
      }
    </ul>
    }

    @if ($activeTab() === 'toc') {
    <ul class="list-view">
      @for (t of $toc(); track track($index)) {
      <li>
        <code>{{ t.href }}</code>
        <span class="title">{{ t.label }}</span>
      </li>
      }
    </ul>
    }

    @if ($activeTab() === 'anchors') {
    <ul class="list-view">
      @for (a of $anchors(); track track($index)) {
      <li>
        <code>{{ a.id }}</code>
        <span class="depth">{{ a.depth }}</span>
        <span class="title">{{ a.text }}</span>
      </li>
      }
    </ul>
    }

    <!-- @if ($activeTab() === 'frame') {
    <pre class="json-view">{{ $frame() | json }}</pre>
    } -->

  </div>
  }
</div>

```

###### 3-1-4-3. ulde-devtools-runtime-inspector.panel.scss
```scss
/* src/ulde/core/devtools/panels/runtime-inspector/ulde-devtools-runtime-inspector.panel.scss */

.devtools-runtime-inspector-panel-root {
  // background: var(--ulde-bg);
  height: 300px;// auto;
  border: 1px solid var(--ulde-border);
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.meta {
  font-size: 0.8rem;
  opacity: 0.7;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tab {
  border: 1px solid var(--ulde-border);
  background: var(--ulde-bg);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.tab.active {
  background: var(--ulde-accent);
  color: #fff;
  border-color: var(--ulde-accent);
}

.body {
  max-height: 260px;
  overflow: auto;
}

.json-view {
  font-family: monospace;
  font-size: 0.8rem;
  background: #1113;
  padding: 0.5rem;
  border-radius: 4px;
}

.list-view {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-view li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid var(--ulde-border);
}

.list-view li:last-child {
  border-bottom: none;
}

code {
  font-family: monospace;
  font-size: 0.8rem;
  background: #0001;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

```

###### 3-1-4-4. ulde-devtools-runtime-inspector.panel.ts
```ts
// src/ulde/core/devtools/panels/runtime-inspector/ulde-devtools-runtime-inspector.panel.ts

import { JsonPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { ULDERendererState } from '@ulde/types/renderer';
import { ULDEAstNode } from '@ulde/types/context';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDEDevtoolsInspectorTab } from '@ulde/types/devtools';

@Component({
  selector: 'ulde-devtools-runtime-inspector-panel',
  imports: [JsonPipe],
  templateUrl: './ulde-devtools-runtime-inspector.panel.html',
  styleUrl: './/ulde-devtools-runtime-inspector.panel.scss',
})
export class UldeDevtoolsRuntimeInspectorPanel {

  $rendererState = input<ULDERendererState | undefined>(undefined);

  $frame = input<ULDEFrame | null>(null);

  $activeTab = signal<ULDEDevtoolsInspectorTab>('ast');

  $astNodes = computed(() => this.$rendererState()?.renderContext?.ast ?? []);
  $layout = computed(() => this.$rendererState()?.renderContext?.layout ?? null);
  // $frame = computed(() => this.$rendererState()?.frame ?? null);
  $sections = computed(() => this.extractSections(this.$astNodes()));
  $toc = computed(() => this.extractToc(this.$astNodes()));
  $anchors = computed(() => this.extractAnchors(this.$astNodes()));

  private extractSections(ast: ULDEAstNode[]) {
    const result: { id: string; depth: number }[] = [];

    function walk(node: ULDEAstNode) {
      if (node.type === 'section') {
        result.push({
          id: node.meta?.['id'] ?? '',
          depth: node.meta?.['depth'],
        });
      }

      node.children?.forEach(child => walk(child));
    }

    ast.forEach(n => walk(n));

    
    return result;
  }

  private extractToc(ast: ULDEAstNode[]) {
    const tocs: { href: string; label: string }[] = [];

    function walk(node: ULDEAstNode) {
      if (node.type === 'link') {
        tocs.push({
          href: node.meta?.['href'],
          label: node.children?.filter(n => n.type === 'text').map(n => n.value).join('') ?? ''
        });
      }

      node.children?.forEach(child => walk(child));
    }

    ast.filter(n => n.type === 'toc').forEach(n => walk(n));

    return tocs;
  }

  private extractAnchors(ast: ULDEAstNode[]) {

    console.log(`Log: [UldeRuntimeInspectorPanel] extractAnchors`);

    const anchors: { id: string; depth: number, text: string }[] = [];
    let depth: number = 0;

    function walk(children: ULDEAstNode[] | undefined) {

      if (children === undefined) return;

      let id: string ='';
      let text: string ='';

      children.forEach((child) => {

        switch (child.type) {
          case 'anchor': {
            id = child.meta?.['id'] ?? '';
            break;
          }
          case 'text': {
            text = child.value ?? '';
            break;
          }
        };

        if (id !== '' && text !== '') {
          anchors.push({
            id: id,
            depth: depth,
            text: text
          });

          walk(child.children);
        }

      });

    }

    ast.filter(n => n.type === 'section').forEach(n => n.children?.filter(n => n.type === 'heading').forEach(n => {
      depth = n.depth ?? -1;
      walk(n.children);
    }));

    return anchors;
  }

  setTab(tab: ULDEDevtoolsInspectorTab) {
    this.$activeTab.set(tab);
  }

  track(i: number) { return i; }


}

```

##### 3-1-5. panels/index.ts
```ts
// src/ulde/core/devtools/panels/index.ts

export * from "./diagnostics";
export * from "./frame-timeline";
export * from "./plugin-timeline";
export * from "./runtime-inspector";

```

#### 3-1-6. index.ts
```ts
// src/ulde/core/devtools/index.ts

export * from './panels';
export * from "./ulde-devtools.service";
export * from "./ulde-devtools";

```

#### 3-1-7. udel-devtools.html
```html
<!-- src/ulde/core/devtools/ulde-devtools.html -->

<p>UldeDevtools Works!</p>
<div class="ulde-devtools-root" [class.hidden]="!$visible()" [style.opacity]="$opacity()">

  <!-- Header -->
  <header class="header">
    <h3>ULDE DevTools Panel</h3>
    <div class="controls">
      <button (click)="toggleDevTools()">Toggle</button>
      <button (click)="pinDevTools()">
        {{ $pinned() ? 'Unpin' : 'Pin' }}
      </button>
      <input type="range" min="0.2" max="1" step="0.1" [value]="$opacity()"
        (input)="setDevToolsOpacity($any($event.target).value)" />
    </div>
  </header>


  <div class="tabs">
    <button class="tab" [class.active]="$activeTab() === 'diagnostics'"
      (click)="selectTab('diagnostics')">Diagnostics</button>
    <button class="tab" [class.active]="$activeTab() === 'timeline'" (click)="selectTab('timeline')">Timeline</button>
    <button class="tab" [class.active]="$activeTab() === 'profiler'" (click)="selectTab('profiler')">Profiler</button>
    <button class="tab" [class.active]="$activeTab() === 'heatmap'" (click)="selectTab('heatmap')">Heatmap</button>
    <button class="tab" [class.active]="$activeTab() === 'inspector'"
      (click)="selectTab('inspector')">Inspector</button>
    <button class="tab" [class.active]="$activeTab() === 'frames'" (click)="selectTab('frames')">Frames</button>
    <button class="tab" [class.active]="$activeTab() === 'plugins'" (click)="selectTab('plugins')">Plugins</button>
    <button class="tab" [class.active]="$activeTab() === 'sparkline'"
      (click)="selectTab('sparkline')">Sparkline</button>
  </div>

  <div class="body">

    @if($activeTab() === 'diagnostics'){
    <!-- Disgnostics -->
    <div class="diagnostics-tab">
      <ulde-devtools-diagnostics-panel [$diagnostics]="$store().diagnostics"></ulde-devtools-diagnostics-panel>
    </div>

    }

    @if($activeTab() === 'timeline'){
    <!-- Timeline -->
    <div class="timeline-tab">
      <ulde-devtools-frame-timeline-panel [$timelines]="$store().timeline"
        [$thresholds]="thresholds"></ulde-devtools-frame-timeline-panel>
    </div>
    }

    @if($activeTab() === 'profiler'){
    <div class="profiler-tab">
    </div>

    }

    @if($activeTab() === 'heatmap'){

    <div class="heatmap-tab">
      <div class="header">
        <span>Plugin Heatmap</span>
      </div>

      <div class="rows">
        @for (t of $store().heatMap; track ($index)) {
        <div class="row">
          <div class="phase">
            <span>{{ t.lifecyclePhase }} </span>
          </div>
          <div class="kind">
            <span>{{ t.pluginKind }} </span>
          </div>
          <div class="plugin hook">
            <span>{{ t.pluginName }} ({{ t.hookName }}) </span>
          </div>
          <!-- <div class="hook">
            <span>{{ t.hookName }} </span>
          </div> -->
          <div class="intensity-container">
            <div class="intensity" [style.width.%]="t.intensity * 100" [style.background]="'#d53c3c'"
              [title]="t.lifecyclePhase + '-' + t.pluginKind + '-' + t.pluginName + '-' + t.hookName ">
            </div>
          </div>
          <div class="ratio">
            <span>{{t.intensity.toFixed(3)}}</span>
          </div>
        </div>
        }
      </div>
    </div>

    }

    @if($activeTab() === 'inspector'){
    <!-- Inspector -->
    <div class="inspector-tab">
      <ulde-devtools-runtime-inspector-panel [$rendererState]="$rendererState()"
        [$frame]="$store().currentFrame"></ulde-devtools-runtime-inspector-panel>
    </div>
    }

    @if($activeTab() === 'frames'){
    <!-- Frames -->
    <div class="frame-history-tab">
      <section class="frame-history">
        <h4>Frame History</h4>

        @for (f of $store().frameHistory; track f.id) {
        <!-- @for (f of $frameHistory(); track f.id) { -->
        <div class="frame-row" (click)="selectFrame(f)">
          <span class="frame-id">Frame Id: {{ f.id }}</span>
          <span class="timestamp">Timestamp: {{ f.timestamp | date:'full' }}</span>
          <span class="total">Total Duration:
            {{
            f.lifecyclePhaseTimings.reduce((a, p) => a + p.duration, 0)
            | number:'1.0-1'
            }}ms
          </span>
          <span class="json-view">
            @for(t of f.lifecyclePhaseTimings; track t.lifecyclePhase; let no = $index){
            <span>#{{no}}: </span>
            <span>{{t| json }}</span><br>
            }
          </span>
        </div>
        }

      </section>
    </div>

    }

    @if($activeTab() === 'plugins'){
    <!-- Plugin Timings -->
    <div class="plugins-tab">
      <ulde-devtools-plugin-timeline-panel [$pluginTimings]="$store().pluginTimings"></ulde-devtools-plugin-timeline-panel>
    </div>
    }

    @if($activeTab() === 'sparkline'){
    <!-- Sparkline -->
    <div class="sparkline-tab">
      <section class="sparkline">
        <h4>Sparline</h4>
        <svg width="100%" height="100%">
          <polyline class="sparkline-line" [attr.points]="$store().sparklinePoints"></polyline>
        </svg>
      </section>

    </div>
    }

  </div>

</div>

```

#### 3-1-8. udel-devtools.scss
```scss
// src/ulde/core/devtools/ulde-devtools.scss

.ulde-devtools-root {
  position: fixed;
  top: 0;
  right: 0;
  width: 650px;
  height: 80vh;
  background: rgba(20, 20, 20, 0.85); // var(--ulde-background
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
}

header.header {
  height: 50px;
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

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;

  .tab {
    border: 1px solid var(--ulde-border);
    background: var(--ulde-bg);
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .tab.active {
    background: var(--ulde-accent);
    color: #fff;
    border-color: var(--ulde-accent);
  }

}


.body {
  height: 65vh; // max-height: auto;
  // overflow: auto;

}


/* Diagnostics */
.diagnostics-tab {
  // max-height: 120px;
  height: auto;
  overflow-y: auto;
  // margin-bottom: 12px;

}

/* Timeline*/
.timeline-tab {
  height: auto;
  overflow-y: auto;
}

/* Profiler*/
.profiler-tab {
  height: auto;
  overflow-y: auto;
}

/* Heatmap */
.heatmap-tab {
  width: 100%;
  // .plugin-timings {
  display: inline-block;
  // flex: 1;
  // max-height: 140px;
  // overflow-y: auto;
  height: auto;
  // margin-bottom: 12px;

  .header {
    margin: 0 0 6px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .rows {
    display: flex;
    flex-direction: column;
    height: 350px;
    gap: 0.5rem;
    overflow: auto;

    .row {
      padding-left: 5px;
      padding-right: 5px;
      width: 95%;
      // width: fit-content;
      display: grid; //inline-flex;
      flex-direction: row;
      align-items: center;
      border: 1px solid var(--ulde-border);
      grid-template-columns: 0.3fr 0.3fr 0.9fr  0.3fr 0.3fr;
      // padding: 4px 0;
      // border-bottom: 1px solid #f3ebeb;
      cursor: pointer;

      &:hover {
        background: rgba(82, 229, 19, 0.582);
      }

      .phase,
      .kind,
      .plugin,
      .hook,
      .ratio {
        padding-right: 2px;
        text-align: left;
        // font-weight: bold;
      }

      .intensity-container {
        height: 10px;
        width: 60px;

        background: #edeaea;
        ;
        // bottom: 0px;

        .intensity {
          display: flex;
          height: 100%;
          transition: width 0.15s linear;
        }

      }

      .ratio {
        color: rgb(241, 11, 11);
        font-weight: bold;
      }
    }
  }
}

/* Inspector */
.inspector-tab {
  height: auto;
  overflow: hidden;
}

/* Frames */
.frame-history-tab {
  display: flex;
  width: fit-content;
  height: auto;
  overflow-y: auto;

  .frame-history {

    // max-height: auto;
    // display: flex;
    overflow-y: auto h4 {
      margin: 0 0 6px 0;
      font-size: 14px;
      font-weight: 600;
    }

    .frame-row {
      display: flex;
      flex-direction: column;
      // display: grid;
      // grid-template-columns: 1fr 1fr 0.7fr;
      padding: 4px 0;
      border-bottom: 1px solid #444;
      cursor: pointer;
      // overflow-y: auto;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .frame-id {
        font-weight: bold;
      }

      .total {
        text-align: left;
      }

      .json-view {
        height: 200px;
        font-family: monospace;
        font-size: 0.8rem;
        background: #1113;
        padding: 0.5rem;
        border-radius: 4px;
        overflow: auto;
      }

    }

  }

}


/* Plugins */
.plugins-tab {
  height: auto;
  overflow: auto;
}


/* Sparkline */
.sparkline-tab {
  height: auto;
  overflow-y: auto;

  .sparkline {
    width: 100px;
    height: 40px;
    background-color: #d2a2a2;
    margin-bottom: 12px;

    .sparkline-line {
      fill: red;
      stroke: #4fc3f7;
      stroke-width: 2;
    }
  }

}

```

#### 3-1-9. udel-devtools.ts
```ts
// src/ulde/core/devtools/ulde-devtools.ts

import { DatePipe, DecimalPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { UldeDevToolsDiagnosticsPanel, UldeDevtoolsFrameTimelinePanel, UldeDevtoolsPluginTimelinePanel, UldeDevtoolsRuntimeInspectorPanel, ULDEDevtoolsService } from '@ulde/core/devtools';
import { ULDERendererState } from '@ulde/types';
import { ULDEDevToolsTab } from '@ulde/types/devtools';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDELifecyclePhaseTiming } from '@ulde/types/lifecycle';

@Component({
  selector: 'ulde-devtools',
  imports: [
    DecimalPipe, DatePipe, JsonPipe,
    UldeDevToolsDiagnosticsPanel,
    UldeDevtoolsFrameTimelinePanel,
    UldeDevtoolsRuntimeInspectorPanel,
    UldeDevtoolsPluginTimelinePanel,

  ],
  templateUrl: './ulde-devtools.html',
  styleUrls: ['./ulde-devtools.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ULDEDevtools {

  $rendererState = input<ULDERendererState>()

  $highlight = output<string>();

  // Declare signals (uninitialized)
  $store = signal<any | null>(null);

  $visible!: typeof this.devtoolsService.$visible;
  $pinned!: typeof this.devtoolsService.$pinned;
  $opacity!: typeof this.devtoolsService.$opacity;

  thresholds!: typeof this.devtoolsService.thresholds;

  $activeTab = signal<ULDEDevToolsTab>('diagnostics');
  selectTab(tab: ULDEDevToolsTab) {
    this.$activeTab.set(tab);
  }

  constructor(
    private devtoolsService: ULDEDevtoolsService,
  ) {

    this.$visible = devtoolsService.$visible;
    this.$pinned = devtoolsService.$pinned;
    this.$opacity = devtoolsService.$opacity;

    this.thresholds = devtoolsService.thresholds;


    // react to devtools data change
    effect(() => {

      this.$store.set(this.devtoolsService.$store());

      console.log(`Log: [UldeDevtools] effect() \ntimeline=`, this.$store().timeline);
    });

  }

  // UI actions
  toggleDevTools() {
    this.devtoolsService.toggle();
  }

  pinDevTools() {
    this.devtoolsService.pin();
  }

  setDevToolsOpacity(value: number) {
    this.devtoolsService.setOpacity(value);
  }

  // Phase selection (for filtering plugin timings)
  selectPhase(phase: ULDELifecyclePhaseTiming) {
    this.devtoolsService.$currentLifecyclePhaseTiming.set(phase);
  }

  clearPhaseSelection() {
    this.devtoolsService.$currentLifecyclePhaseTiming.set(null);
  }

  // Frame selection (for timeline/sparkline)
  selectFrame(frame: ULDEFrame) {
    this.devtoolsService.$currentFrame.set(frame);
  }


  trackDiag(i: number, d: ULDEDiagnostic) {
    return `${d.level}-${d.message}-${i}`;
  }

  onHighlight(msg: string) {
    this.$highlight.emit(msg);
  }
}

```

#### 3-1-10. index.ts
```ts
// src/ulde/core/index.ts

export * from "./devtools/index";
export * from "./ulde-lifecycle.service";
export * from "./ulde-plugin-registry.service";
export * from "./ulde-runtime.service";


```

#### 3-1-11. ulde-lifecycle.service.ts
```ts
// src/ulde/core/ulde-lifecycle.service.ts

import { Injectable } from '@angular/core';
import { ULDEPluginRegistryService, ULDERuntimeService } from '@ulde/core';
import { ULDEDevtoolsService } from '@ulde/core/devtools';
import { ULDEPageContext, ULDERenderContext, } from '@ulde/types/context';
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';

import { ULDERenderContextBuilderService } from '@ulde/engine';

@Injectable({ providedIn: 'root' })
export class ULDELifecycleService {

  constructor(
    private devtoolsService: ULDEDevtoolsService,
    private pluginRegistry: ULDEPluginRegistryService,
    private runtime: ULDERuntimeService,
    private renderContextBuilder: ULDERenderContextBuilderService,
  ) { }


  /**
   * Wrap lifecycle phase start/end with devtoolsService timing.
   */
  private async runPluginByLifecyclePhase(
    lifecyclePhase: ULDELifecyclePhase,
    ctx: Record<string, any> = {}
  ) {
    this.devtoolsService.startPhase(lifecyclePhase);

    try {
      await this.pluginRegistry.runPhase(lifecyclePhase, {
        ...ctx,
        lifecyclePhase: lifecyclePhase,
      });

      this.devtoolsService.endPhase(lifecyclePhase);
    } catch (err) {
      this.devtoolsService.addDiagnostic({
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
    await this.runPluginByLifecyclePhase('init');

    // LOAD (content + navigation plugins)
    await this.runPluginByLifecyclePhase('load', pageContext);

    // RENDER
    // 1. Build initial AST
    const initialAst = this.renderContextBuilder.buildInitialAst(pageContext);

    // 2. Run render phase plugins on AST
    await this.runPluginByLifecyclePhase('render', { ...pageContext, ast: initialAst });

    // 3. Build final context (sections + diagnostics + HTML)
    const renderContext = this.renderContextBuilder.buildFinalContext(pageContext, initialAst);

    // // RENDER (layout plugins)
    // const renderContext = await this.renderContextBuilder.build(pageContext);
    // await this.runPluginByLifecyclePhase('render', renderContext);

    // // HTML generation
    // if (!renderContext.ast) {
    //   this.devtoolsService.addDiagnostic({ level: 'error', message: 'AST missing after render phase' });
    // }

    // renderContext.html = renderUldeAstToHtml(renderContext.ast);


    // HYDRATE (interactive plugins)
    await this.runPluginByLifecyclePhase('hydrate', renderContext);

    // AFTER RENDER (ULDE system plugins)
    await this.runPluginByLifecyclePhase('afterRender', renderContext);

    // Cleanup + diagnostics
    await this.pluginRegistry.destroyAll();
    this.runtime.finalizeFrameAndAnalyze();

    return renderContext;
  }
}

```

#### 3-1-12. ulde-plugin-registry.service.ts
```ts
// src/ulde/core/ulde-plugin-registry.service.ts

import { Injectable } from '@angular/core';
import { ULDEDevtoolsService } from '@ulde/core';
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';
import { ULDEPluginInstance, ULDEPlugin, ULDEPluginFactory } from '@ulde/types/plugin';

import { ULDE_PLUGIN_REGISTRY } from '@ulde/plugins/registry'; // updated registry
import { ULDEPluginHookAdapter } from '@ulde/plugins/adaptors';

@Injectable({ providedIn: 'root' })
export class ULDEPluginRegistryService {


  /**
   * All instantiated plugins (run‑based instances).
   * Legacy plugins are wrapped using ULDEPluginHookAdapter.
   */
  private instances: ULDEPluginInstance[] = [];

  constructor(private devtoolsService: ULDEDevtoolsService) {
    this.instantiateAllPlugins();
  }

  /**
  * Instantiate all plugins from the registry using factories.
  */
  private instantiateAllPlugins() {
    this.instances = Object.values(ULDE_PLUGIN_REGISTRY)
      .flat()
      .map(factory => this.instantiateFromFactory(factory))
      .filter(plugin => plugin.enabled !== false);
  }

  /**
   * Instantiate plugin from factory.
   * Detect legacy plugins (ULDEPlugin) vs new plugins (ULDEPluginInstance).
   */
  private instantiateFromFactory(factory: ULDEPluginFactory): ULDEPluginInstance {
    const raw = factory();

    // Legacy plugin: has "hooks"
    if ((raw as ULDEPlugin).hooks) {
      return new ULDEPluginHookAdapter(raw as ULDEPlugin);
    }

    // New plugin: already run‑based
    return raw as ULDEPluginInstance;
  }

  /**
   * Run all plugins assigned to a lifecycle phase.
   */
  async runPhase(
    phase: ULDELifecyclePhase,
    ctx: Record<string, any> = {}
  ): Promise<void> {

    const factories = ULDE_PLUGIN_REGISTRY[phase] || [];

    for (const factory of factories) {
      const raw: ULDEPlugin | ULDEPluginInstance = factory();
      const plugin = ('hooks' in raw) ?
        new ULDEPluginHookAdapter(raw as ULDEPlugin)
        : (raw as ULDEPluginInstance);

      if (!plugin) continue;

      const start = performance.now();

      try {
        await plugin.run({
          ...ctx,
          lifecyclePhase: phase,
        });
      } catch (err) {
        this.devtoolsService.addDiagnostic({
          level: 'error',
          message: `Plugin "${plugin.pluginName}" failed in phase "${phase}": ${String(err)}`,
          pluginName: plugin.pluginName,
          lifecyclePhase: phase,
        });
      }

      const end = performance.now();

      this.devtoolsService.recordPluginTiming({
        pluginName: plugin.pluginName,
        pluginKind: plugin.pluginKind,
        hookName: 'run',
        lifecyclePhase: phase,
        duration: end - start,
      })
        ;
    }
  }

  /**
   * Destroy all plugins (called at end of lifecycle).
   */
  async destroyAll() {
    for (const plugin of this.instances) {
      if (!plugin.destroy) continue;

      const start = performance.now();

      try {
        await plugin.destroy();
      } catch (err) {
        this.devtoolsService.addDiagnostic({
          level: 'error',
          message: `Plugin "${plugin.pluginName}" failed in destroy(): ${String(err)}`,
          pluginName: plugin.pluginName,
          lifecyclePhase: 'afterRender',
        });
      }

      const end = performance.now();

      this.devtoolsService.recordPluginTiming({
        pluginName: plugin.pluginName,
        pluginKind: plugin.pluginKind,
        hookName: 'destroy',
        lifecyclePhase: 'afterRender',
        duration: end - start,
      });
    }

    this.instances = [];
  }

  /**
   * List all instantiated plugins.
   */
  list() {
    return [...this.instances];
  }
}


```

#### 3-1-13. ulde-runtime.service.ts
```ts
// src/ulde/core/ulde-runtime.service.ts

import { Injectable } from '@angular/core';
import {ULDEDevtoolsService } from '@ulde/core';
import { ULDEFrame } from '@ulde/types/frame';


@Injectable({ providedIn: 'root' })
export class ULDERuntimeService {
  // Simple thresholds (tune as needed)
  private phaseWarnThreshold = 12;   // ms
  private phaseErrorThreshold = 24;  // ms
  private pluginWarnThreshold = 8;   // ms
  private pluginErrorThreshold = 16; // ms

  constructor(
    private devtoolsService: ULDEDevtoolsService,

  ) { }

  /**
   * Called at the end of each full lifecycle (afterRender).
   * Orchestrates frame finalization + anomaly detection.
   */
  finalizeFrameAndAnalyze() {
    this.devtoolsService.finalizeFrame();

    const frame = this.devtoolsService.$currentFrame();
    if (!frame) return;

    this.detectPhaseAnomalies(frame);
    this.detectPluginAnomalies(frame);
  }

  private detectPhaseAnomalies(frame: ULDEFrame) {
    for (const phase of frame.lifecyclePhaseTimings) {
      if (phase.duration > this.phaseErrorThreshold) {
        this.devtoolsService.addDiagnostic({
          level: 'error',
          message: `Lifecycle phase "${phase.lifecyclePhase}" exceeded error threshold (${this.phaseErrorThreshold}ms): ${phase.duration.toFixed(1)}ms`,
          lifecyclePhase: phase.lifecyclePhase,
        });
      } else if (phase.duration > this.phaseWarnThreshold) {
        this.devtoolsService.addDiagnostic({
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
        this.devtoolsService.addDiagnostic({
          level: 'error',
          message: `Plugin "${t.pluginName}" in hook "${t.hookName}" exceeded error threshold (${this.pluginErrorThreshold}ms): ${t.duration.toFixed(1)}ms`,
          pluginName: t.pluginName,
          lifecyclePhase: t.lifecyclePhase,
        });
      } else if (t.duration > this.pluginWarnThreshold) {
        this.devtoolsService.addDiagnostic({
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
import { ULDELayoutEngineService } from './ulde-layout.engine.service';

import { ULDEDevtoolsService } from '@ulde/core/devtools';
import { ULDEDiagnostic } from '@ulde/types';
import { ULDEDiagnosticNode } from '@ulde/types/context';


@Injectable({ providedIn: 'root' })
export class ULDERenderContextBuilderService {


  constructor(
    private layoutEngine: ULDELayoutEngineService,
    private devtoolsService: ULDEDevtoolsService,
  ) { }

  /**
    * Build the initial AST from page tokens.
    * This is called before the render phase plugins.
    */
  buildInitialAst(page: ULDEPageContext) {
    const ast = buildUldeAst(page.token);
    return ast;
  }


  /**
     * Build the final render context AFTER layout plugins have
     * mutated the AST (sections, anchors, TOC, etc.).
     *
     * This is called AFTER the 'render' lifecycle phase.
     */
  buildFinalContext(page: ULDEPageContext, ast: any[]): ULDERenderContext {
    // 1. Layout: sections (now that plugins have mutated AST)
    const sectionAst = this.layoutEngine.buildSections(ast);

    // 2. Inject diagnostics into AST
    const diagnostics = this.devtoolsService.$diagnostics();
    const diagnosticNodes: ULDEDiagnosticNode[] = diagnostics.map((d: ULDEDiagnostic) => ({
      type: 'diagnostic',
      meta: {
        level: d.level,
        message: d.message,
        lifecyclePhase: d.lifecyclePhase,
        pluginName: d.pluginName,
      },
    }));

    const finalAst = [...sectionAst, ...diagnosticNodes];

    // 3. Render HTML from final AST
    const html = renderUldeAstToHtml(finalAst);

    // 4. Assemble render context
    const currentFrame = this.devtoolsService.$currentFrame();

    return {
      pageId: page.pageId,
      ast: finalAst,
      html,
      // layout: sectionAst, // for test
      layout: 'sections', // original
      frame: currentFrame ?? undefined,
    };
  }

}


```

### 5. src/ulde/plugins/

#### 5-1. adaptors/
```ts
// src/ulde/plugins/adaptors/index.ts

export * from './ulde-plugin-hook-adaptor';

```

##### 5-1-1. index.ts
```ts
// src/ulde/plugins/adaptors/index.ts

export * from './ulde-plugin-hook-adaptor';

```

##### 5-1-2. ulde-plugin-hook-adaptor.ts
```ts
// src/ulde/plugins/adaptors/ulde-plugin-hook-adaptor.ts

import { ULDEPluginInstance, ULDEPluginKind, ULDEPlugin } from "@ulde/types";

export class ULDEPluginHookAdapter implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind;
  pluginName: string;
  enabled?: boolean;

  constructor(private legacy: ULDEPlugin) {
    this.pluginKind = legacy.pluginKind;
    this.pluginName = legacy.pluginName;
    this.enabled = legacy.enabled;
  }

  async run(ctx: any) {
    const phase = ctx.lifecyclePhase;

    switch (phase) {
      case 'init':
        return this.legacy.hooks.onInit?.();
      case 'load':
        return this.legacy.hooks.onPageLoad?.(ctx);
      case 'render':
        return this.legacy.hooks.onBeforeRender?.(ctx);
      case 'hydrate':
        return this.legacy.hooks.onAfterRender?.(ctx);
      case 'afterRender':
        return this.legacy.hooks.onDestroy?.();
    }
  }

  async destroy() {
    return this.legacy.hooks.onDestroy?.();
  }
}

```

#### 5-2. contributor/

Maybe for the future

#### 5-3. registry/

##### 5-3-1. index.ts
```ts
// src/ulde/plugins/registry/index.ts

export * from './ulde-plugin-registry';

```

##### 5-3-2. ulde-plugin-registry.ts
```ts
// src/ulde/plugins/registry/ulde-plugin-registry.ts

import {
  ULDECodeblockPlugin,
} from '@ulde/plugins/system/content/ulde-codeblock.plugin';
import {
  ULDEFrontmatterNormalizerPlugin,
} from '@ulde/plugins/system/content/ulde-frontmatter-normalizer.plugin';

import {
  ULDEDemoPlugin,
} from '@ulde/plugins/system/demo/ulde-demo.plugin';
import {
  ULDEPlaygroundInjectorPlugin,
} from '@ulde/plugins/system/demo/ulde-playground-injector.plugin';

import {
  ULDEDummyTestPlugin,
} from '@ulde/plugins/system/interactive/ulde-dummy-test.plugin';

import {
  ULDEAnchorPlugin,
} from '@ulde/plugins/system/layout/ulde-anchor.plugin';
import {
  ULDETocPlugin,
} from '@ulde/plugins/system/layout/ulde-toc.plugin';

import {
  ULDENavigationBreadcrumbsPlugin,
} from '@ulde/plugins/system/navigation/ulde-navigation-breadcrumbs.plugin';

import {
  ULDEOverlayCustomPanelPlugin,
} from '@ulde/plugins/system/ulde/ulde-overlay-custom-panel.plugin';
import {
  ULDESlowPluginDetectorPlugin,
} from '@ulde/plugins/system/ulde/ulde-slow-plugin-detector.plugin';
import {
  ULDETimelineProfilerPlugin,
} from '@ulde/plugins/system/ulde/ulde-timeline-profiler.plugin';

import { ULDEPluginRegistryMap } from '@ulde/types/plugin';



/** ULDE Plugin Registry (factory-based)
 * Phase‑aware, deterministic ULDE plugin registry.
 * This is the single source of truth for plugin ordering.
 */
export const ULDE_PLUGIN_REGISTRY: ULDEPluginRegistryMap = {
  // Reserved for future init‑only plugins
  init: [],

  // Content + navigation: operate on page context / tokens / early AST
  load: [
    () => ULDEFrontmatterNormalizerPlugin,
    () => ULDECodeblockPlugin,
    () => ULDEDemoPlugin,
    () => ULDEDummyTestPlugin,
    () => ULDENavigationBreadcrumbsPlugin,
  ],

  // Layout: operate on AST structure (sections, anchors, TOC)
  render: [
    () => ULDEAnchorPlugin,
    () => new ULDETocPlugin(),
  ],

  // Interactive: operate on rendered HTML / DOM
  hydrate: [
    () => ULDEPlaygroundInjectorPlugin,
  ],

  // ULDE system: diagnostics, overlay, performance analysis
  afterRender: [
    () => ULDEOverlayCustomPanelPlugin,
    () => ULDESlowPluginDetectorPlugin,
    () => ULDETimelineProfilerPlugin,
  ],
};

```

#### 5-4. system/

##### 5-4-1. content/

###### 5-4-1-1. index.ts
```ts
// src/ulde/plugins/system/content/index.ts

export * from "./ulde-codeblock.plugin";
export * from "./ulde-frontmatter-normalizer.plugin";

```

###### 5-4-1-2. ulde-codeblock.plugin.ts
```ts
// src/ulde/plugins/system/content/ulde-codeblock.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";

export const ULDECodeblockPlugin: ULDEPlugin = {
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

###### 5-4-1-3. ulde-frontmatter-normalizer.plugin.ts
```ts
/// src/ulde/plugins/system/content/ulde-frontmatter-normalizer.plugin.ts

import { ULDEPlugin } from '@ulde/types/plugin';

export const ULDEFrontmatterNormalizerPlugin: ULDEPlugin = {
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

##### 5-4-2. demo/

###### 5-4-2-1. index.ts
```ts
/// src/ulde/plugins/system/demo/index.ts

export * from "./ulde-demo.plugin";
export * from "./ulde-playground-injector.plugin";

```

###### 5-4-2-2. ulde-demo.plugin.ts
```ts
// src/ulde/plugins/system/demo/ulde-demo.plugin.ts

import { ULDEPlugin } from '@ulde/types/plugin';
import { visitUldeAst } from '@ulde/engine';

export const ULDEDemoPlugin: ULDEPlugin = {
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

export const  ULDEPlaygroundInjectorPlugin: ULDEPlugin = {
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

##### 5-4-3. interactive/

###### 5-4-3-1. index.ts
```ts
// src/ulde/plugins/system/interactive/index.ts

export * from "./ulde-dummy-test.plugin";

```

###### 5-4-2. ulde-dummy-test.plugin.ts
```ts
// src/ulde/plugins/system/interactive/ulde-dummy-test.plugin.ts


import { ULDERenderContext } from '@ulde/types/context';
import { ULDEPlugin } from '@ulde/types/plugin';

export const ULDEDummyTestPlugin: ULDEPlugin = {
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

##### 5-4-4. layout/

###### 5-4-4-1. index.ts
```ts
// src/ulde/plugins/system/layout/index.ts

export * from "./ulde-anchor.plugin";
export * from "./ulde-toc.plugin";

```

###### 5-4-4-2. ulde-anchor.plugin.ts
```ts
// src/ulde/plugins/system/layout/ulde-anchor.plugin.ts

import { ULDEPlugin } from '@ulde/types/plugin';
import { visitUldeAst } from '@ulde/engine';

export const ULDEAnchorPlugin: ULDEPlugin = {
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

###### 5-4-4-3. ulde-toc.plugin.ts
```ts
// src/ulde/plugins/system/layout/ulde-toc.plugin.ts

import { ULDEPluginInstance, ULDEPluginKind } from '@ulde/types/plugin';
import { ULDERenderContext, ULDETocNode } from '@ulde/types/context';
import { visitUldeAst } from '@ulde/engine';

export class ULDETocPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'layout';
  pluginName = 'auto-toc';
  enabled = true;

  async run(ctx: ULDERenderContext & { lifecyclePhase: string }) {
    if (ctx.lifecyclePhase !== 'render') return;

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
    const tocNode: ULDETocNode = {
      type: 'toc',
      children: headings.map(h => ({
        type: 'link',
        meta: { href: `#${slugify(h.text)}` },
        children: [{ type: 'text', value: h.text }]
      }))
    };

    // Inject TOC at top
    ctx.ast.unshift(tocNode);

    console.log(`[ULDETocPlugin] TOC injected. AST now:`, ctx.ast);

    ctx.frame?.diagnostics

  }

  destroy() {
    // No teardown needed
  }
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}


```

##### 5-4-5. navigation/

###### 5-4-5-1. index.ts
```ts
// src/ulde/plugins/system/navigation/index.ts

export * from "./ulde-navigation-breadcrumbs.plugin";

```

###### 5-4-5-2. ulde-navigation-breadcrumbs.plugin.ts
```ts
// src/ulde/plugins/system/navigation/ulde-navigation-breadcrumbs.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";

export const ULDENavigationBreadcrumbsPlugin: ULDEPlugin = {
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

##### 5-4-6. ulde/

###### 5-4-6-1. index.ts
```ts
// src/ulde/plugins/system/ulde/index.ts

export * from "./ulde-overlay-custom-panel.plugin";
export * from './ulde-slow-plugin-detector.plugin'
export * from './ulde-timeline-profiler.plugin'

```

###### 5-4-6-2. ulde-overlay-custom-panel.plugin.ts
```ts
// src/ulde/plugins/system/ulde/ulde-overlay-custom-panel.plugin.ts

import { ULDEPlugin } from "@ulde/types//plugin";

export const ULDEOverlayCustomPanelPlugin: ULDEPlugin = {
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

###### 5-4-6-3. ulde-slow-plugin-detector.plugin.ts
```ts
// src/ulde/plugins/system/ulde/ulde-slow-pluging-detector.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";
import { ULDEPluginTiming } from "@ulde/types/timing";

export const ULDESlowPluginDetectorPlugin: ULDEPlugin = {
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

###### 5-4-6-4. ulde-timeline-profiler.plugin.ts
```ts
// src/ulde/plugins/system/ulde/ulde-timeline-profiler.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";

export const ULDETimelineProfiler: ULDEPlugin = {
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

##### 5-4-7. index.ts
```ts
// src/ulde/plugins/system/index.ts

export * from "./content/index";
export * from "./demo/index";
export * from "./interactive/index";
export * from "./layout/index";
export * from "./navigation/index";
export * from "./ulde/index";

```

#### 5-5. index.ts
```ts
// src/ulde/plugins/index.ts

export * from "./adaptors/index";
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

import { ULDEDiagnosticLevel } from '@ulde/types/diagnostics';
import { ULDEFrame } from "@ulde/types/frame";
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';
import { ULDEPluginKind } from '@ulde/types/plugin';
import type Token from 'markdown-it/lib/token.mjs';

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
  frame?: ULDEFrame;
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

#### 7-2. devtools/

##### 7-2-1. index.ts
```ts
// src/ulde/types/devtools/index.ts

export * from "./ulde-devtools.types";

```

##### 7-2-2. ulde-devtools.types.ts
```ts
// src/ulde/types/devtools/ulde-devtools.types.ts

import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";
import { ULDEPluginKind, ULDEPluginExecutionHook } from "../plugin/ulde-plugin.types";

// ---------------------------------------------------------
// ULDE DevTools Types
// ---------------------------------------------------------

export interface ULDETimelinePoint {
  frameId: string;
  timeStamp: number;
  totalDuration: number;
  phases: {
    lifecyclePhase: ULDELifecyclePhase;
    duration: number;
  }[];
}

export interface ULDEHeatmapCell {
  pluginName: string;
  pluginKind: ULDEPluginKind;
  hookName: ULDEPluginExecutionHook//keyof ULDEPluginHooks;
  lifecyclePhase: ULDELifecyclePhase;
  intensity: number; // normalized 0–1
}

export type ULDEDevToolsTab =
  | 'diagnostics'
  | 'timeline'
  | 'profiler'
  | 'heatmap'
  | 'inspector'
  | 'frames'
  | 'plugins'
  | 'sparkline';

  export type ULDEDevtoolsInspectorTab =
  | 'ast'
  | 'layout'
  | 'sections'
  | 'toc'
  | 'anchors'
  // | 'frame'


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

import { ULDEDiagnostic } from "@ulde/types/diagnostics";
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
import { ULDELifecyclePhase } from "@ulde/types/lifecycle";

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
// ULDE Plugin Definition - Legacy
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
// ULDE Plugin Hooks - Legacy
// ---------------------------------------------------------

export interface ULDEPluginHooks {
  onInit?(): void | Promise<void>;
  onPageLoad?(ctx: ULDEPageContext): void | Promise<void>;
  onBeforeRender?(ctx: ULDERenderContext): void | Promise<void>;
  onAfterRender?(ctx: ULDERenderContext): void | Promise<void>;
  onDestroy?(): void | Promise<void>;
}

/**
 * ULDE Plugin Instance - Unified Runtime Plugin
 * Every plugin ULDE executes will be an instance of this type.
 */
export interface ULDEPluginInstance {
  pluginKind: ULDEPluginKind;
  pluginName: string;
  enabled?: boolean;

  /**
   * Unified execution entry point.
   * The registry decides which lifecycle phase is being executed.
   */
  run(ctx: any): void | Promise<void>;

  /**
   * Optional teardown hook.
   */
  destroy?(): void | Promise<void>;
}

/**
 * ULDE Plugin Classs
 * This is the type stored in the registry
 * This ensures:
 *  registry stores classes
*   registry instantiates instances
*   lifecycle executes run()
 */
export type ULDEPluginClass = {
  new (...args: any[]): ULDEPluginInstance;
};


/**
 * Factory type:
 * Returns either:
 *  - a legacy ULDEPlugin (object)
 *  - a new ULDEPluginInstance (class instance)
 */
export type ULDEPluginFactory = () => ULDEPlugin | ULDEPluginInstance;

/**
 * Phase-aware plugin registry using factories.
 */
export type ULDEPluginRegistryMap = {
  [P in ULDELifecyclePhase]?: ULDEPluginFactory[];
};


export type ULDEPluginExecutionHook =
  | 'run'
  | 'destroy'
  | keyof ULDEPluginHooks;

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
import { ULDEDiagnostic } from "@ulde/types/diagnostics";
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
  highlightDiagnostic(message: string): void;
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

import { ULDEPluginKind, ULDEPluginExecutionHook } from "@ulde/types/plugin";
import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";

// ---------------------------------------------------------
// ULDE Plugin Timing
// timing of ONE plugin hook execution
// ---------------------------------------------------------

export interface ULDEPluginTiming {
  pluginName: string;
  pluginKind: ULDEPluginKind;
  hookName: ULDEPluginExecutionHook;
  lifecyclePhase: ULDELifecyclePhase;
  duration: number;
}

```

#### 7-9. index.ts
```ts
// src/ulde/types/index.ts

export * from "./context/index";
export * from "./devtools/index";
export * from "./diagnostics/index";
export * from "./frame/index";
export * from "./lifecycle/index";
export * from "./plugin/index";
export * from "./renderer/index";
export * from "./timing/index";

```

### 8. src/ulde/viewer/

#### 8-1. styles/

##### 8-1-1. ulde-viewer-base.scss
```scss
// src/ulde/viewer/styles/ulde-viewer-base.scss

/* This file defines the global look of ULDE pages */

:root {
  --ulde-font: 'Segoe UI', Roboto, sans-serif;
  --ulde-bg: #ffffff;
  --ulde-text: #222222;
  --ulde-accent: #0078d4;
  --ulde-border: #e0e0e0;
  --ulde-muted: #666666;

  --ulde-section-spacing: 2rem;
  --ulde-heading-spacing: 1.2rem;
  --ulde-paragraph-spacing: 0.75rem;

  --ulde-demo-bg: #f5f7fa;
  --ulde-demo-border: #d0d7e0;

  --ulde-diagnostic-info: #0078d4;
  --ulde-diagnostic-warn: #e6a100;
  --ulde-diagnostic-error: #d83b01;
}

ulder-viewer,
.ulde-viewer-root {
  font-family: var(--ulde-font);
  background: var(--ulde-bg);
  color: var(--ulde-text);
  line-height: 1.6;
  padding: 1rem;
}

```

##### 8-1-2. ulde-viewer-components.scss
```scss
// src/ulde/viewer/styles/ulde-viewer-components.scss

/* This file styles ULDE AST ouput */

/* Headings */
.ulde-section > h1,
.ulde-section > h2,
.ulde-section > h3 {
  margin-top: var(--ulde-heading-spacing);
  margin-bottom: var(--ulde-heading-spacing);
  font-weight: 600;
}

/* Paragraphs */
.ulde-paragraph {
  margin-bottom: var(--ulde-paragraph-spacing);
}

/* TOC */
.ulde-toc {
  border-left: 3px solid var(--ulde-accent);
  padding-left: 1rem;
  margin-bottom: 2rem;
}

.ulde-toc a {
  display: block;
  color: var(--ulde-accent);
  text-decoration: none;
  margin-bottom: 0.25rem;
}

.ulde-toc a:hover {
  text-decoration: underline;
}

/* Anchors */
a[data-ulde-anchor] {
  cursor: pointer;
  color: var(--ulde-accent);
}

/* Demo Blocks */
.ulde-demo {
  background: var(--ulde-demo-bg);
  border: 1px solid var(--ulde-demo-border);
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 6px;
  cursor: pointer;
}

.ulde-demo:hover {
  background: #eef2f7;
}

```

##### 8-1-3. ulde-viewer-theme-dark.scss
```scss
// src/ulde/viewer/styles/ulde-viewer-theme-dark.scss

/* Dark theme (default) */

[data-theme="dark"] {
  --ulde-bg: #1e1e1e;
  --ulde-text: #e0e0e0;
  --ulde-accent: #4da3ff;
  --ulde-border: #333333;
  --ulde-muted: #aaaaaa;

  --ulde-demo-bg: #2a2d2e;
  --ulde-demo-border: #3a3d3e;
}

```

##### 8-1-4. ulde-viewer-theme-light.scss
```scss
// src/ulde/viewer/styles/ulde-viewer-theme-light.scss

/* Light theme (default) */

[data-theme="light"] {
  --ulde-bg: #ffffff;
  --ulde-text: #222222;
  --ulde-accent: #0078d4;
  --ulde-border: #e0e0e0;
  --ulde-muted: #666666;

  --ulde-demo-bg: #f5f7fa;
  --ulde-demo-border: #d0d7e0;
}

```

#### 8-2. index.ts
```ts
// src/ulde/viewer/index.ts

export * from "./ulde-renderer.service";
export * from "./ulde-viewer";

```

#### 8-3. ulde-renderer.service.ts
```ts
// src/ulde/viewer/ulde-renderer.service.ts

import { ElementRef, Injectable } from '@angular/core';
import { ULDERenderContext, } from '@ulde/types/context';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';
import { ULDEFrame } from '@ulde/types/frame';
import {
  ULDERendererConfig, ULDERendererEvents, ULDERendererHandle, ULDERendererState
} from '@ulde/types/renderer';

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

  highlightDiagnostic(message: string): void{
    this.handle?.highlightDiagnostic(message);
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

    function highlightDiagnostic(message: string) {
      const nodes = config.container.querySelectorAll('.ulde-diagnostic');

      nodes.forEach(n => {
        if (n.textContent?.includes(message)) {
          n.classList.add('ulde-diagnostic-highlight');

          setTimeout(() => {
            n.classList.remove('ulde-diagnostic-highlight');
          }, 1500);
        }
      });
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


      highlightDiagnostic(message: string) {
        highlightDiagnostic(message);
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

#### 8-4. ulde-viewer.html
```html
<!-- src/ulde/viewer/ulde-viewer.html -->

<div class="ulde-viewer-root">
  <div #viewerHost class="viewer-host"></div>

  <ulde-devtools [$rendererState]="$rendererState()" ></ulde-devtools>

</div>


```

#### 8-5. ulde-viewer.scss
```scss
// src/ulde/viewer/ulde-viewer.scss

.ulde-viewer-root {
  position: relative;
}

.viewer-host {
  min-height: 400px;
}

```

#### 8-6. ulde-viewer.ts
```ts
// src/ulde/viewer/ulde-viewer.ts

import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input, output, signal } from '@angular/core';
import { ULDEDevtools, ULDEDevtoolsService } from '@ulde/core';
import { ULDEFrame } from '@ulde/types/frame';
import type { ULDERendererState } from '@ulde/types/renderer';
import { ULDERendererService } from '@ulde/viewer';
import { isBrowser } from '../../app/global.utils/global.utils';

@Component({
  selector: 'ulde-viewer',
  imports: [
    ULDEDevtools
  ],
  templateUrl: 'ulde-viewer.html',
  styleUrl: 'ulde-viewer.scss',
})
export class UldeViewer implements AfterViewInit, OnDestroy {
  @ViewChild('viewerHost', { static: true })
  hostRef!: ElementRef<HTMLElement>;

  // Full renderer state comes in as a signal input
  $rendererState = input<ULDERendererState>(); // inspector

  $ready = output<void>();
  $error = output<Error>();
  $stateChange = output<ULDERendererState>();


  constructor(
    public rendererService: ULDERendererService,
    private devtoolsService: ULDEDevtoolsService,
  ) {
    // 🔥 React to ULDE lifecycle phases
    effect(() => {
      const phase = this.devtoolsService.$currentLifecyclePhaseTiming();
      if (!phase) return;

      this.rendererService.setState({
        currentLifecyclePhase: phase.lifecyclePhase,
      });
    });

    // 🔥 React to diagnostics
    effect(() => {
      const diagnostics = this.devtoolsService.$diagnostics();
      if (diagnostics.length < 1) return;

      console.log(`Log: [UldeViewer] effect() -> diagnostics=\n`, diagnostics);
      this.rendererService.setState({ diagnostics });

    });

    // 🔥 React to frame finalization
    effect(() => {
      const currentFrame = this.devtoolsService.$currentFrame();

      if (!currentFrame) return;

      this.rendererService.setState({ frame: currentFrame });
      
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
        onReady: () => this.$ready.emit(),
        onError: (e) => this.$error.emit(e),
        onStateChange: (s) => this.$stateChange.emit(s),
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

  /**
   * Theme Switcher
   * @param theme
   */
  setTheme(theme: 'light' | 'dark') {
    this.hostRef.nativeElement.setAttribute('data-theme', theme);
  }

  onHighLight(message: string) {
    this.rendererService.highlightDiagnostic(message)
  }

  getFrame(): ULDEFrame | null {
    const frame = this.rendererService.getState()?.frame;
    if (!frame) return null;
    return frame

  }
}

```

**Ignore the below lines, just for my note***


## 3. Road Map - 1

Great — let’s continue **ULDE Implementation Part 3** exactly in the order you chose.  
We’ll build each layer cleanly, one after another, without touching legacy code until the new viewer stack is complete.

Below is the **full roadmap**, with each item expanded into a concrete, implementable module.  
Every section includes Guided Links so you can jump directly into the next step.

---

**⭐ 1. ULDE Viewer Styling**  
This is the foundation. Before diagnostics panels, timelines, or inspectors, the viewer needs a **visual identity**.

### What we add
- Base typography  
- Section spacing  
- TOC styling  
- Anchor styling  
- Demo block styling  
- Diagnostic block styling  
- Frame/timeline badges  
- Theme variables (light/dark)

### Structure
```
src/ulde/viewer/styles/
  viewer-base.scss
  viewer-theme-light.scss
  viewer-theme-dark.scss
  viewer-components.scss
```

### Key goals
- Make ULDE pages readable  
- Make diagnostics visually distinct  
- Make demo blocks look interactive  
- Prepare for theme switching  

### Next step  
Proceed to **viewer styling**.

---

**⭐ 2. Viewer Diagnostics Panel**  
Once styling exists, we add a **diagnostics panel** that shows:

- lifecycle diagnostics  
- plugin diagnostics  
- AST diagnostics  
- viewer diagnostics (render errors, missing nodes)

### UI
A collapsible panel:

```
┌──────────────────────────────┐
│ Diagnostics (4)              │
├──────────────────────────────┤
│ [warn] Hydrate slow          │
│ [error] Plugin toc failed    │
│ [info] Section missing id    │
└──────────────────────────────┘
```

### Implementation
- Add a diagnostics overlay component  
- Bind to `rendererService.setState({ diagnostics })`  
- Render diagnostics in a floating panel  
- Click to expand/collapse  

### Next step  
Proceed to **viewer diagnostics panel**.

---

**# ⭐ 3. Viewer Frame Timeline**  
This visualizes ULDE lifecycle timing:

```
Render → Layout → Plugins → Hydrate → Finalize
```

### UI
A horizontal timeline:

```
Render (3ms) | Layout (1ms) | Plugins (8ms) | Hydrate (2ms) | Finalize (1ms)
```

### Implementation
- Add a timeline component  
- Bind to `rendererService.setState({ frame })`  
- Render timing bars  
- Color-code slow phases  

### Next step  
Proceed to **viewer frame timeline**.

---

**# ⭐ 4. Plugin Execution Timeline**  
This is a per-plugin breakdown:

```
toc: 3ms
anchors: 1ms
demo: 5ms
sections: 2ms
```

### UI
A vertical list or bar chart:

```
┌──────────────────────────────┐
│ Plugin Execution Timeline    │
├──────────────────────────────┤
│ toc        ███ 3ms           │
│ anchors    █ 1ms             │
│ demo       █████ 5ms         │
│ sections   ██ 2ms            │
└──────────────────────────────┘
```

### Implementation
- Add plugin timing to ULDEFrame  
- Viewer renders plugin timing bars  
- Highlight slow plugins  

### Next step  
Proceed to **plugin execution timeline**.

---

**# ⭐ 5. ULDE Runtime Inspector**  
This is the most powerful viewer feature.  
It lets you inspect:

- AST  
- Layout tree  
- Sections  
- TOC  
- Anchors  
- Diagnostics  
- Plugin metadata  

### UI
A sidebar inspector:

```
AST
  - section
  - heading
  - paragraph
  - demo
  - diagnostic

Layout
  - section depth=1
  - section depth=2
```

### Implementation
- Add inspector panel  
- Bind to `renderContext.ast`  
- Render AST tree  
- Click nodes to highlight them in the viewer  

### Next step  
Proceed to **runtime inspector**.

---

**# ⭐ 6. ULDE Plugin Sandbox**  
This replaces `eval()` with a safe execution environment.

### Features
- Safe JS execution  
- No global scope access  
- No bundler warnings  
- Optional console capture  
- Optional iframe sandbox  

### Implementation options
#### Option A — `new Function()` sandbox  
Simple, safe, bundler-friendly.

#### Option B — iframe sandbox  
Full isolation.

#### Option C — Web Worker sandbox  
Async + safe.

### Next step  
Proceed to **plugin sandbox**.

---

**# ⭐ 7. ULDE Viewer Theme System**  
Finally, we add:

- Light theme  
- Dark theme  
- Custom theme  
- Theme switcher  
- CSS variables  

### Implementation
```
:root {
  --ulde-bg: #fff;
  --ulde-text: #222;
  --ulde-accent: #0078d4;
}
[data-theme="dark"] {
  --ulde-bg: #111;
  --ulde-text: #eee;
  --ulde-accent: #4da3ff;
}
```

### Next step  
Proceed to **viewer theme system**.

---

**# 🎉 You now have a complete ULDE Viewer Phase roadmap**  
We will implement each module one by one, cleanly, without touching legacy code until the viewer stack is complete.

Which module do you want to start with?

- **ULDE viewer styling**  
- **Viewer diagnostics panel**  
- **Viewer frame timeline**  
- **Plugin execution timeline**  
- **Runtime inspector**  
- **Plugin sandbox**  
- **Viewer theme system**



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


