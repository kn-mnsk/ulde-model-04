// src/ulde/viewer/ulde-viewer.ts

import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input, output, signal } from '@angular/core';
import { ULDEDevtools, ULDEDevtoolsService } from '@ulde/core';
import { ULDEDiagnostic, ULDEFrame, ULDEHeatmapCell, ULDEPluginTiming, ULDETimelinePoint } from '@ulde/types';
import type { ULDERendererState } from '@ulde/types/renderer';
import { ULDERendererService } from '@ulde/viewer';
// UldeDiagnosticsPanel, UldeFrameTimelinePanel, UldeRuntimeInspectorPanel } from '@ulde/viewer';
// import { UldePluginTimelinePanel } from '@ulde/viewer/panels/plugin-timeline/ulde-plugin-timeline-panel';
import { isBrowser } from '../../app/global.utils/global.utils';

@Component({
  selector: 'ulde-viewer',
  imports: [
    // UldeDiagnosticsPanel,
    // UldeFrameTimelinePanel,
    //  UldePluginTimelinePanel,
    // UldeRuntimeInspectorPanel,
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

  $diagnostics = signal<ULDEDiagnostic[]>([]); // disgnostics
  $currentFrame = signal<ULDEFrame | null>(null); // timeline, inspector
  /* profiler */
  $heatMap = signal<ULDEHeatmapCell[]>([]); // heatmap
  $frameHistory = signal<ULDEFrame[]>([]); // frames
  $filteredPluginTimings = signal<ULDEPluginTiming[]>([]); // plugins
  $sparklinePoints = signal<string | null>(null); // sparkline


  $pluginTimings = signal<ULDEPluginTiming[]>([]);

  $timeline = signal<ULDETimelinePoint[]>([]);




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
      this.$diagnostics.set(diagnostics);
    });

    // 🔥 React to frame finalization
    effect(() => {
      const currentFrame = this.devtoolsService.$currentFrame();
      const frameHistory = this.devtoolsService.$frameHistory()
      const heatmap = this.devtoolsService.$heatMap();
      const timeline = this.devtoolsService.$timeline();
      const filteredPluginTimings = this.devtoolsService.$filteredPluginTimings().filtered;
      const sparklinePoints = this.devtoolsService.$sparklinePoints().points;

      if (!currentFrame) return;

      this.rendererService.setState({ frame: currentFrame });
      this.$currentFrame.set(currentFrame);
      this.$frameHistory.set(frameHistory);
      this.$heatMap.set(heatmap);
      this.$timeline.set(timeline);
      // this.$lifecyclePhaseTimings.set(frame.lifecyclePhaseTimings);
      this.$pluginTimings.set(currentFrame.pluginTimings);
      this.$filteredPluginTimings.set(filteredPluginTimings);
      this.$sparklinePoints.set(sparklinePoints);

      console.log(`Log: [UldeViewer] effect() ->currentFrame.pluginTimings=\n`, currentFrame.pluginTimings);
      console.log(`Log: [UldeViewer] effect() ->sparklinePoints=\n`, sparklinePoints);
      // console.log(`Log: [UldeViewer] effect() -> currentFrame=\n`, currentFrame);
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
