// src/ulde/core/devtools/ulde-devtools.service.ts

import { computed, Injectable, signal } from '@angular/core';
import { ULDEHeatmapCell, ULDETimelinePoint } from '@ulde/types';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDELifecyclePhase, ULDELifecyclePhaseTiming } from '@ulde/types/lifecycle';
import { ULDEPluginTiming } from '@ulde/types/timing';

@Injectable({ providedIn: 'root' })
export class ULDEDevtoolsService {

  // devtools visibility + controls
  $visible = signal(true);
  $pinned = signal(false);
  $opacity = signal(1);

  // Lifecycle state
  $lifecyclePhaseTimings = signal<ULDELifecyclePhaseTiming[]>([]);
  $currentLifecyclePhaseTiming = signal<ULDELifecyclePhaseTiming | null>(null);

  // Plugin timings
  $pluginTimings = signal<ULDEPluginTiming[]>([]);

  // Frames
  $frameHistory = signal<ULDEFrame[]>([]);
  $currentFrame = signal<ULDEFrame | null>(null);
  // Diagnostics
  $diagnostics = signal<ULDEDiagnostic[]>([]);

  // Analytics
  $timeline = signal<ULDETimelinePoint[]>([]);
  $heatMap = signal<ULDEHeatmapCell[]>([]);

  // Thresholds (tweakable)
  thresholds = {
    phaseWarn: 8,
    phaseError: 16,
  };

  // signal to update computed signal
  $reloadToComputedSugnals = signal<number>(0);
  // Derived: sparkline points
  $sparklinePoints = computed(() => {
    const history = this.$frameHistory();
    let points: string;

    if (!history.length) {
      points = ''
    } else {
      points = history
        .map((f, i) => {
          const total = f.lifecyclePhaseTimings.reduce((a, p) => a + p.duration, 0);
          return `${i * 10},${40 - Math.min(total, 40)}`;
        })
        .join(' ');
    }

    console.log(`Log: [ULDEOverlayService] sparklinePoints`, points);

    return { reload: this.$reloadToComputedSugnals(), points: points };
  });
  // Derived: filtered plugin timings by lifecycle phase
  $filteredPluginTimings = computed(() => {
    const lifecyclePhaseTiming = this.$currentLifecyclePhaseTiming();
    const timings = this.$pluginTimings();

    return { reload: this.$reloadToComputedSugnals(), filtered: (!lifecyclePhaseTiming) ? timings : timings.filter(t => t.lifecyclePhase === lifecyclePhaseTiming.lifecyclePhase) };
    //   if (!lifecyclePhaseTiming) return timings;
    //   return timings.filter(t => t.lifecyclePhase === lifecyclePhaseTiming.lifecyclePhase);
  });

  // Frame lifecycle
  startPhase(lifecyclePhase: ULDELifecyclePhase) {
    this.$currentLifecyclePhaseTiming.set({
      lifecyclePhase,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
    });
  }
  endPhase(lifecyclePhase: ULDELifecyclePhase) {
    const phase = this.$currentLifecyclePhaseTiming();
    if (!phase || phase.lifecyclePhase !== lifecyclePhase) return;

    const end = performance.now();
    const duration = end - phase.startTime;

    const updatedPhase: ULDELifecyclePhaseTiming = {
      ...phase,
      endTime: end,
      duration,
    };

    this.$lifecyclePhaseTimings.update(list => [...list, updatedPhase]);
    this.$currentLifecyclePhaseTiming.set(null);
  }
  finalizeFrame() {
    const frame: ULDEFrame = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      lifecyclePhaseTimings: this.$lifecyclePhaseTimings(),
      pluginTimings: this.$pluginTimings(),
      diagnostics: this.$diagnostics()
    };

    this.$frameHistory.update(list => [...list.slice(-50), frame]); // keep last 50 frames

    this.$heatMap.set(this.buildHeatmap());
    this.$timeline.set(this.buildTimeline());
    this.generateWarnings();
    this.$currentFrame.set(frame);
    this.$reloadToComputedSugnals.update(n => n + 1);


    // reset for next frame
    this.$lifecyclePhaseTimings.set([]);
    this.$pluginTimings.set([]);
  }

  // Diagnostics
  addDiagnostic(diag: ULDEDiagnostic) {
    this.$diagnostics.update(list => [...list, diag]);
  }
  /**
   * Generate warnings based on patterns in frame history.
   */
  generateWarnings() {
    const frameHistory = this.$frameHistory();
    if (frameHistory.length < 3) return;

    const lastThree = frameHistory.slice(-3);
    const durations = lastThree.map(f =>
      f.lifecyclePhaseTimings.reduce((sum, p) => sum + p.duration, 0)
    );

    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const last = durations[durations.length - 1];

    // Sudden spike detection
    if (last > avg * 1.5) {
      this.addDiagnostic({
        level: 'warn',
        message: `Frame duration spike detected: ${last.toFixed(1)}ms (avg ${avg.toFixed(1)}ms)`
      });
    }

    // Consistent slowdown detection
    if (durations.every(d => d > avg)) {
      this.addDiagnostic({
        level: 'warn',
        message: `Consistent slowdown across last 3 frames`
      });
    }
  }

  // Analytics
  // Plugin timing recording
  recordPluginTiming(timing: ULDEPluginTiming) {
    this.$pluginTimings.update(list => [...list, timing]);
  }
  /**
     * Build a timeline of frames with total durations.
     */
  buildTimeline(): ULDETimelinePoint[] {
    return this.$frameHistory().map(frame => {
      const total = frame.lifecyclePhaseTimings.reduce((sum, p) => sum + p.duration, 0);

      return {
        frameId: frame.id,
        totalDuration: total,
        phases: frame.lifecyclePhaseTimings.map(p => ({
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
    const frameHistory = this.$frameHistory();
    const timings = frameHistory.flatMap(f => f.pluginTimings);

    if (!timings.length) return [];

    const max = Math.max(...timings.map(t => t.duration));

    return timings.map(t => ({
      pluginKind: t.pluginKind,
      pluginName: t.pluginName,
      hookName: t.hookName,
      lifecyclePhase: t.lifecyclePhase,
      intensity: t.duration / max // normalized 0–1
    }));
  }

  // UI - control methods
  toggle() {
    this.$visible.update(v => !v);
  }
  pin() {
    this.$pinned.update(p => !p);
  }
  setOpacity(value: number) {
    this.$opacity.set(value);
  }

}

