// src/ulde/core/overlay/ulde-overlay.ts

import { DatePipe, DecimalPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ULDEDevtoolsService } from '@ulde/core/devtools';
import { ULDEHeatmapCell, ULDETimelinePoint } from '@ulde/types';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDELifecyclePhaseTiming } from '@ulde/types/lifecycle';

@Component({
  selector: 'ulde-devtools',
  imports: [DecimalPipe, DatePipe, JsonPipe],
  templateUrl: './ulde-devtools.html',
  styleUrls: ['./ulde-devtools.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ULDEDevtools {

  $diagnostics = input<ULDEDiagnostic[]>([]);
  $currentFrame = input<ULDEFrame | null>(null);
  $frameHistory = input<ULDEFrame[]>([]);
  $heatMap = input<ULDEHeatmapCell[]>([]);
  $timeline = input<ULDETimelinePoint[]>([]);

  // Declare fields (uninitialized)
  $lifecyclePhaseTimings!: typeof this.devtoolsService.$lifecyclePhaseTimings;
  $pluginTimings!: typeof this.devtoolsService.$pluginTimings;
  // $frameHistory!: typeof this.devtoolsService.$frameHistory;
  // $diagnostics!: typeof this.devtoolsService.$diagnostics;
  // $heatMap!: typeof this.devtoolsService.$heatMap;
  // $timelinePoint!: typeof this.devtoolsService.$TimelinePoint;

  $currentLifecyclePhaseTiming!: typeof this.devtoolsService.$currentLifecyclePhaseTiming;
  // $currentFrame!: typeof this.devtoolsService.$currentFrame;

  $sparklinePoints!: typeof this.devtoolsService.$sparklinePoints;
  $filteredPluginTimings!: typeof this.devtoolsService.$filteredPluginTimings;

  $visible!: typeof this.devtoolsService.$visible;
  $pinned!: typeof this.devtoolsService.$pinned;
  $opacity!: typeof this.devtoolsService.$opacity;


  thresholds!: typeof this.devtoolsService.thresholds;

  constructor(
    private devtoolsService: ULDEDevtoolsService,
  ) {
    // Assign AFTER DI is ready
    this.$lifecyclePhaseTimings = devtoolsService.$lifecyclePhaseTimings;
    this.$pluginTimings = devtoolsService.$pluginTimings;
    // this.$frameHistory = devtoolsService.$frameHistory;
    // this.$diagnostics = devtoolsService.$diagnostics;
    // this.$heatMap = devtoolsService.$heatMap;
    // this.$timelinePoint = devtoolsService.$TimelinePoint;

    this.$currentLifecyclePhaseTiming = devtoolsService.$currentLifecyclePhaseTiming;
    // this.$currentFrame = devtoolsService.$currentFrame;

    this.$sparklinePoints = devtoolsService.$sparklinePoints;
    this.$filteredPluginTimings = devtoolsService.$filteredPluginTimings;

    this.$visible = devtoolsService.$visible;
    this.$pinned = devtoolsService.$pinned;
    this.$opacity = devtoolsService.$opacity;

    this.thresholds = devtoolsService.thresholds;

  }

  // UI actions
  toggleOverlay() {
    this.devtoolsService.toggle();
  }

  pinOverlay() {
    this.devtoolsService.pin();
  }

  setOverlayOpacity(value: number) {
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
}
