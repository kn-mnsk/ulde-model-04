// src/ulde/viewer/panels/frame-timeline/ulde-frame-timeline-panel.ts

import { Component, input, signal, computed } from '@angular/core';
import { ULDEFrame } from '@ulde/types/frame';

@Component({
  selector: 'ulde-frame-timeline-panel',
  imports: [],
  templateUrl: './ulde-frame-timeline-panel.html',
  styleUrl: './ulde-frame-timeline-panel.scss',
})
export class UldeFrameTimelinePanel {

  $frame = input<ULDEFrame | null>(null);

  total: number = 0;

  phases = computed(() => {
    if (!this.$frame()) return [];

    const timings = this.$frame()?.lifecyclePhaseTimings ?? [];
    this.total = timings.reduce((sum, t) => sum + t.duration, 0) || 1;

    const listTimings = timings.map(t => ({
      name: t.lifecyclePhase as string,
      ms: t.duration,
      ratio: t.duration / this.total,
      color: phaseColor(t.lifecyclePhase),
    }));

    // this.total = total;
    // listTimings.push({
    //   name: 'total',
    //   ms: total,
    //   ratio: 1,
    //   color: '#000000'
    // });
    return listTimings;
    // return listTimings.push({
    //   name: 'total',
    //   ms: total,
    //   ratio: 1,
    //   color: '#cccccc'
    // });
    // //    timings.map(t => ({
    //     name: t.lifecyclePhase,
    //     ms: t.duration,
    //     ratio: t.duration / total,
    //     color: phaseColor(t.lifecyclePhase),
    //   }));
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
