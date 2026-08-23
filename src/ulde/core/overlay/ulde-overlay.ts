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
