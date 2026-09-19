// src/ulde/core/devtools/panels/frame-timeline/ulde-devtools-frame-timeline.panel.ts

import { Component, input, computed, Signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ULDELifecyclePhase } from '@ulde/types';
import { ULDEFrame } from '@ulde/types/frame';

@Component({
  selector: 'ulde-devtools-frame-timeline-panel',
  imports: [DatePipe],
  templateUrl: './ulde-devtools-frame-timeline.panel.html',
  styleUrl: './ulde-devtools-frame-timeline.panel.scss',
})
export class UldeDevtoolsFrameTimelinePanel {

  $frame = input<ULDEFrame | null>(null);

  $total = computed(() => {
    const frame = this.$frame();
    return (frame !== null) ? frame.lifecyclePhaseTimings.reduce((sum, t) => sum + t.duration, 0) : 1;
  });

  $phases = computed(() => {
    if (!this.$frame()) return [];

    const timings = this.$frame()?.lifecyclePhaseTimings ?? [];

    return timings.map(t => ({
      name: t.lifecyclePhase as string,
      ms: t.duration,
      ratio: t.duration / this.$total(),
      // ratio: t.duration / this.total,
      color: phaseColor(t.lifecyclePhase),
    }));
  });
}

function phaseColor(phase: ULDELifecyclePhase) {
  switch (phase) {
    case 'init': return '#607d8b';
    case 'load': return '#03a9f4';
    case 'render': return '#4caf50';
    case 'hydrate': return '#9c27b0';
    case 'afterRender': return '#9e9e9e';
    default: return '#cccccc';
  }
}
