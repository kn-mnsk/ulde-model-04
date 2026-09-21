// src/ulde/core/devtools/ulde-devtools.ts

import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { DatePipe, DecimalPipe, JsonPipe } from '@angular/common';
import { UldeDevToolsDiagnosticsPanel, UldeDevtoolsFrameTimelinePanel, UldeDevtoolsRuntimeInspectorPanel, ULDEDevtoolsService, UldePluginTimelinePanel } from '@ulde/core/devtools';
import { ULDEHeatmapCell, ULDETimelinePoint, ULDEDevToolsTab } from '@ulde/types/devtools';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDELifecyclePhaseTiming } from '@ulde/types/lifecycle';
import { ULDEPluginTiming, ULDERendererState } from '@ulde/types';

@Component({
  selector: 'ulde-devtools',
  imports: [
    DecimalPipe, DatePipe, JsonPipe,
    UldeDevToolsDiagnosticsPanel,
    UldeDevtoolsFrameTimelinePanel,
    UldeDevtoolsRuntimeInspectorPanel,
    UldePluginTimelinePanel,

  ],
  templateUrl: './ulde-devtools.html',
  styleUrls: ['./ulde-devtools.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ULDEDevtools {

  $rendererState = input<ULDERendererState>()

  $diagnostics = input<ULDEDiagnostic[]>([]);
  $currentFrame = input<ULDEFrame | null>(null);
  $frameHistory = input<ULDEFrame[]>([]);
  $heatMap = input<ULDEHeatmapCell[]>([]);
  $timeline = input<ULDETimelinePoint[]>([]);
  $filteredPluginTimings = input<ULDEPluginTiming[]>([]);
  $sparklinePoints = input<string | null>(null);
  $pluginTimings = input<ULDEPluginTiming[]>([]);

  $highlight = output<string>();

  // Declare fields (uninitialized)
  $lifecyclePhaseTimings!: typeof this.devtoolsService.$lifecyclePhaseTimings;


  $currentLifecyclePhaseTiming!: typeof this.devtoolsService.$currentLifecyclePhaseTiming;

  // $sparklinePoints!: typeof this.devtoolsService.$sparklinePoints;
  // $filteredPluginTimings!: typeof this.devtoolsService.$filteredPluginTimings;

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
    // Assign AFTER DI is ready
    this.$lifecyclePhaseTimings = devtoolsService.$lifecyclePhaseTimings;
    // this.$pluginTimings = devtoolsService.$pluginTimings;
    // this.$frameHistory = devtoolsService.$frameHistory;
    // this.$diagnostics = devtoolsService.$diagnostics;
    // this.$heatMap = devtoolsService.$heatMap;
    // this.$timelinePoint = devtoolsService.$TimelinePoint;

    this.$currentLifecyclePhaseTiming = devtoolsService.$currentLifecyclePhaseTiming;
    // this.$currentFrame = devtoolsService.$currentFrame;

    // this.$sparklinePoints = devtoolsService.$sparklinePoints;
    // this.$filteredPluginTimings = devtoolsService.$filteredPluginTimings;

    this.$visible = devtoolsService.$visible;
    this.$pinned = devtoolsService.$pinned;
    this.$opacity = devtoolsService.$opacity;

    this.thresholds = devtoolsService.thresholds;

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
