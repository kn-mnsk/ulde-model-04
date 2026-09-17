// src/ulde/core/overlay/ulde-overlay.ts

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe, DatePipe, JsonPipe } from '@angular/common'
import { ULDEOverlayService } from '@ulde/core/overlay';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDELifecyclePhaseTiming } from '@ulde/types/lifecycle';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';
import { ULDEHeatmapCell, ULDETimelinePoint } from '@ulde/types';

@Component({
  selector: 'ulde-overlay',
  imports: [DecimalPipe, DatePipe, JsonPipe],
  templateUrl: './ulde-overlay.html',
  styleUrls: ['./ulde-overlay.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ULDEOverlay {

  $diagnostics = input<ULDEDiagnostic[]>([]);
  $currentFrame = input<ULDEFrame | null>(null);
  $frameHistory = input<ULDEFrame[]>([]);
  $heatMap = input<ULDEHeatmapCell[]>([]);
  $timeline = input<ULDETimelinePoint[]>([]);

  // Declare fields (uninitialized)
  $lifecyclePhaseTimings!: typeof this.overlayService.$lifecyclePhaseTimings;
  $pluginTimings!: typeof this.overlayService.$pluginTimings;
  // $frameHistory!: typeof this.overlayService.$frameHistory;
  // $diagnostics!: typeof this.overlayService.$diagnostics;
  // $heatMap!: typeof this.overlayService.$heatMap;
  // $timelinePoint!: typeof this.overlayService.$TimelinePoint;

  $currentLifecyclePhaseTiming!: typeof this.overlayService.$currentLifecyclePhaseTiming;
  // $currentFrame!: typeof this.overlayService.$currentFrame;

  $sparklinePoints!: typeof this.overlayService.$sparklinePoints;
  $filteredPluginTimings!: typeof this.overlayService.$filteredPluginTimings;

  $visible!: typeof this.overlayService.$visible;
  $pinned!: typeof this.overlayService.$pinned;
  $opacity!: typeof this.overlayService.$opacity;


  thresholds!: typeof this.overlayService.thresholds;

  constructor(
    private overlayService: ULDEOverlayService,
  ) {
    // Assign AFTER DI is ready
    this.$lifecyclePhaseTimings = overlayService.$lifecyclePhaseTimings;
    this.$pluginTimings = overlayService.$pluginTimings;
    // this.$frameHistory = overlayService.$frameHistory;
    // this.$diagnostics = overlayService.$diagnostics;
    // this.$heatMap = overlayService.$heatMap;
    // this.$timelinePoint = overlayService.$TimelinePoint;

    this.$currentLifecyclePhaseTiming = overlayService.$currentLifecyclePhaseTiming;
    // this.$currentFrame = overlayService.$currentFrame;

    this.$sparklinePoints = overlayService.$sparklinePoints;
    this.$filteredPluginTimings = overlayService.$filteredPluginTimings;

    this.$visible = overlayService.$visible;
    this.$pinned = overlayService.$pinned;
    this.$opacity = overlayService.$opacity;

    this.thresholds = overlayService.thresholds;

  }

  // UI actions
  toggleOverlay() {
    this.overlayService.toggle();
  }

  pinOverlay() {
    this.overlayService.pin();
  }

  setOverlayOpacity(value: number) {
    this.overlayService.setOpacity(value);
  }

  // Phase selection (for filtering plugin timings)
  selectPhase(phase: ULDELifecyclePhaseTiming) {
    this.overlayService.$currentLifecyclePhaseTiming.set(phase);
  }

  clearPhaseSelection() {
    this.overlayService.$currentLifecyclePhaseTiming.set(null);
  }

  // Frame selection (for timeline/sparkline)
  selectFrame(frame: ULDEFrame) {
    this.overlayService.$currentFrame.set(frame);
  }
}
