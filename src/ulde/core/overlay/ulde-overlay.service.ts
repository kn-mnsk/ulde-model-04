// src/ulde/core/overlay/ulde-overlay.service.ts

import { computed, Injectable, signal } from '@angular/core';
import { ULDEDiagnostic } from '@ulde/types/diagnostic';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDELifecyclePhase, ULDELifecyclePhaseTiming } from '@ulde/types/lifecycle';
import { ULDEPluginTiming } from '@ulde/types/timing';

@Injectable({ providedIn: 'root' })
export class ULDEOverlayService {
  // Overlay visibility + controls
  visible = signal(true);
  pinned = signal(false);
  opacity = signal(1);

  // Lifecycle state
  lifecyclePhaseTimings = signal<ULDELifecyclePhaseTiming[]>([]);
  currentLifecyclePhaseTiming = signal<ULDELifecyclePhaseTiming | null>(null);

  // Plugin timings
  pluginTimings = signal<ULDEPluginTiming[]>([]);

  // Frame history
  frames = signal<ULDEFrame[]>([]);
  currentFrame = signal<ULDEFrame | null>(null);

  // Diagnostics
  diagnostics = signal<ULDEDiagnostic[]>([]);

  // Thresholds (tweakable)
  thresholds = {
    phaseWarn: 8,
    phaseError: 16,
  };

  // Derived: sparkline points
  sparklinePoints = computed(() => {
    const history = this.frames();
    if (!history.length) return '';

    return history
      .map((f, i) => {
        const total = f.lifecyclePhaseTimings.reduce((a, p) => a + p.duration, 0);
        return `${i * 10},${40 - Math.min(total, 40)}`;
      })
      .join(' ');
  });

  // Derived: filtered plugin timings by lifecycle phase
  filteredPluginTimings = computed(() => {
    const lifecyclePhaseTiming = this.currentLifecyclePhaseTiming();
    const timings = this.pluginTimings();

    if (!lifecyclePhaseTiming) return timings;
    return timings.filter(t => t.lifecyclePhase === lifecyclePhaseTiming.lifecyclePhase);
  });

  // Overlay control methods
  toggle() {
    this.visible.update(v => !v);
  }

  pin() {
    this.pinned.update(p => !p);
  }

  setOpacity(value: number) {
    this.opacity.set(value);
  }

  // Lifecycle event handlers
  startPhase(lifecyclePhase: ULDELifecyclePhase) {
    this.currentLifecyclePhaseTiming.set({
      lifecyclePhase,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
    });
  }

  endPhase(lifecyclePhase: ULDELifecyclePhase) {
    const phase = this.currentLifecyclePhaseTiming();
    if (!phase || phase.lifecyclePhase !== lifecyclePhase) return;

    const end = performance.now();
    const duration = end - phase.startTime;

    const updatedPhase: ULDELifecyclePhaseTiming = {
      ...phase,
      endTime: end,
      duration,
    };

    this.lifecyclePhaseTimings.update(list => [...list, updatedPhase]);
    this.currentLifecyclePhaseTiming.set(null);
  }

  // Plugin timing recording
  recordPluginTiming(timing: ULDEPluginTiming) {
    this.pluginTimings.update(list => [...list, timing]);
  }

  // Frame finalization
  finalizeFrame() {
    const frame: ULDEFrame = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      lifecyclePhaseTimings: this.lifecyclePhaseTimings(),
      pluginTimings: this.pluginTimings(),
      diagnostics: this.diagnostics()
    };

    this.frames.update(list => [...list.slice(-50), frame]); // keep last 50 frames
    this.currentFrame.set(frame);

    // reset for next frame
    this.lifecyclePhaseTimings.set([]);
    this.pluginTimings.set([]);
  }

  // Diagnostics
  addDiagnostic(diag: ULDEDiagnostic) {
    this.diagnostics.update(list => [...list, diag]);
  }


}

