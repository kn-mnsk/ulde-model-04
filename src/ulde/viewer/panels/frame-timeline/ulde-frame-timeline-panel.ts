// src/ulde/viewer/panels/frame-timeline/ulde-frame-timeline-panel.ts

import { Component, input, computed } from '@angular/core';
import { ULDEFrame} from '@ulde/types/frame';

@Component({
  selector: 'ulde-frame-timeline-panel',
  imports: [],
  templateUrl: './ulde-frame-timeline-panel.html',
  styleUrl: './ulde-frame-timeline-panel.scss',
})
export class UldeFrameTimelinePanel {

  $frame = input<ULDEFrame | null>(null);

  phases = computed(() => {
    if (!this.$frame()) return [];

    const timings = this.$frame()?.lifecyclePhaseTimings ?? [];
    const total = timings.reduce((sum, t) => sum + t.duration, 0) || 1;

    return timings.map(t => ({
      name: t.lifecyclePhase,
      ms: t.duration,
      ratio: t.duration / total,
      color: phaseColor(t.lifecyclePhase),
    }));
  });
}

function phaseColor(phase: string) {
  switch (phase) {
    case 'init': return '#607d8b';
    case 'load': return '#03a9f4';
    case 'render': return '#4caf50';
    case 'hydrate': return '#9c27b0';
    case 'afterRender': return '#9e9e9e';
    default: return '#cccccc';
  }
}
