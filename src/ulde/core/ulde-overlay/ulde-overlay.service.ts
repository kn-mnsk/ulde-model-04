import { Injectable, signal, computed } from '@angular/core';
import { ULDEPhase, ULDEPluginTiming, ULDEFrame, ULDEDiagnostic, ULDELifecyclePhase } from '../../types/ulde.types';

@Injectable({ providedIn: 'root' })
export class ULDEOverlayService {
  // Overlay visibility + controls
  visible = signal(true);
  pinned = signal(false);
  opacity = signal(1);

  // Lifecycle state
  phases = signal<ULDEPhase[]>([]);
  currentPhase = signal<ULDEPhase | null>(null);

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
      .map((f, i) => `${i * 10},${40 - Math.min(f.phases.reduce((a, p) => a + p.duration, 0), 40)}`)
      .join(' ');
  });

  // Derived: filtered plugin timings by phase
  filteredPluginTimings = computed(() => {
    const phase = this.currentPhase();
    const timings = this.pluginTimings();

    if (!phase) return timings;
    return timings.filter(t => t.pluginPhase === phase.);
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
  startPhase(lifecycleName: ULDELifecyclePhase) {
    this.currentPhase.set({
      lifecyclePhase,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
    });
  }

  endPhase(name: string) {
    const phase = this.currentPhase();
    if (!phase || phase.lifecyclePhase !== name) return;

    const end = performance.now();
    const duration = end - phase.startTime;

    const updatedPhase: ULDEPhase = {
      ...phase,
      endTime: end,
      duration,
    };

    this.phases.update(list => [...list, updatedPhase]);
    this.currentPhase.set(null);
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
      phases: this.phases(),
      pluginTimings: this.pluginTimings(),
    };

    this.frames.update(list => [...list.slice(-50), frame]); // keep last 50 frames
    this.currentFrame.set(frame);

    // reset for next frame
    this.phases.set([]);
    this.pluginTimings.set([]);
  }

  // Diagnostics
  addDiagnostic(diag: ULDEDiagnostic) {
    this.diagnostics.update(list => [...list, diag]);
  }
}
