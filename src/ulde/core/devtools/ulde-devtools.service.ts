// src/ulde/core/devtools/ulde-devtools.service.ts

import { computed, Injectable, signal, Signal } from '@angular/core';
import { ULDEDevtoolsSnapshot, ULDEExecutionContext, ULDEHeatmapCell, ULDEPluginKind, ULDEPluginStatistics, ULDETimelinePoint, ULDETrendSnapshot } from '@ulde/types';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDELifecyclePhase, ULDELifecyclePhaseTiming } from '@ulde/types/lifecycle';
import { ULDEPluginTiming } from '@ulde/types/timing';
import { ULDERendererService } from '@ulde/viewer';

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
  $currentFrame = signal<ULDEFrame | undefined>(undefined);
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
  $reloadComputedSugnals = signal<number>(0);
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

    return { reload: this.$reloadComputedSugnals(), points: points };
  });
  // Derived: filtered plugin timings by lifecycle phase
  $filteredPluginTimings = computed(() => {
    const lifecyclePhaseTiming = this.$currentLifecyclePhaseTiming();
    const timings = this.$pluginTimings();

    return { reload: this.$reloadComputedSugnals(), filtered: (!lifecyclePhaseTiming) ? timings : timings.filter(t => t.lifecyclePhase === lifecyclePhaseTiming.lifecyclePhase) };
    //   if (!lifecyclePhaseTiming) return timings;
    //   return timings.filter(t => t.lifecyclePhase === lifecyclePhaseTiming.lifecyclePhase);
  });

  $pluginStats = computed<ULDEPluginStatistics[]>(() => {
    const timings = this.$pluginTimings();

    // sort by pluginKind, then by pluginName
    const stat1 = timings.sort((a, b) => {
      const pluginKindResult = safeCompare(a.pluginKind, b.pluginKind);
      if (pluginKindResult !== 0) {
        return pluginKindResult;
      }
      return safeCompare(a.pluginName, b.pluginName);
      // }).map(t => { return { key: `${t.pluginKind} ${t.pluginName}`, duration: t.duration }; }
    }).map(t => { return { key: { kind: t.pluginKind, name: t.pluginName }, duration: t.duration }; }


    );

    const duraionByKey = stat1.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.key.kind + ',' + curr.key.name] += curr.duration
      return acc;
    },
      {},
    );

    const executions = stat1.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.key.kind + ',' + curr.key.name] += 1
      return acc;
    }, {}
    );

    return Object.entries(duraionByKey).map(([k, v]) => {
      return {
        pluginName: k.split(',')[1],
        pluginKind: k.split(',')[0] as ULDEPluginKind,
        executions: executions[k],
        averageDuration: 0,
        maxDuration: 0,
        totalDuration: duraionByKey[k]
      }
    })
  });

  // signal stores
  $store = computed(() => {
    return {
      diagnostics: this.$diagnostics(),
      currentFrame: this.$currentFrame(),
      frameHistory: this.$frameHistory(),
      heatMap: this.$heatMap(),
      timeline: this.$timeline(),
      filteredPluginTimings: this.$filteredPluginTimings().filtered,
      pluginTimings: this.$pluginTimings(),
      sparklinePoints: this.$sparklinePoints().points,
      reload: this.$reloadComputedSugnals()
    };
  });

  $generateDevtoolsSnapshot(executionContext: ULDEExecutionContext): Signal<ULDEDevtoolsSnapshot> {

    executionContext.artifacts.diagnostics = this.$diagnostics();
    executionContext.artifacts.frame = this.$currentFrame();

    return computed(() => {
      return {
        executionContext: executionContext,
        frameHistory: this.$frameHistory(),
        analytics: {
          timeline: this.$timeline(),
          heatMap: this.$heatMap(),
          trends: {} as ULDETrendSnapshot,
          pluginStats: this.$pluginStats(),
        }
      }
    });
  }


  constructor() { }

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
      // diagnostics: this.$diagnostics()
    };

    this.$frameHistory.update(list => [...list.slice(-50), frame]); // keep last 50 frames

    this.$heatMap.set(this.buildHeatmap());
    this.$timeline.set(this.buildTimeline());
    this.generateWarnings();
    this.$currentFrame.set(frame);
    // this.$reloadComputedSugnals.update(n => n + 1);


    // reset for next frame
    this.$lifecyclePhaseTimings.set([]);
    // this.$pluginTimings.set([]);
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
  /**
   * Plugin timing recording
   * @param timing
   */
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
        timeStamp: frame.timestamp,
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

// Safe string comparison function
function safeCompare(a: string | null, b: string | null): number {
  const strA = a ?? ""; // Treat null/undefined as empty string
  const strB = b ?? "";
  return strA.localeCompare(strB, undefined, { sensitivity: "base" });
}
