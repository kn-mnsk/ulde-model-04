// /src/ulde/core/ulde-runtime.service.ts

import { Injectable } from '@angular/core';
import { ULDEOverlayService } from './ulde-overlay/ulde-overlay.service';
import { ULDEFrame } from '../types/ulde.types';

@Injectable({ providedIn: 'root' })
export class ULDERuntimeService {
  // Simple thresholds (tune as needed)
  private phaseWarnThreshold = 12;   // ms
  private phaseErrorThreshold = 24;  // ms
  private pluginWarnThreshold = 8;   // ms
  private pluginErrorThreshold = 16; // ms

  constructor(private overlay: ULDEOverlayService) {}

  /**
   * Called at the end of each full lifecycle (afterRender).
   * Orchestrates frame finalization + anomaly detection.
   */
  finalizeFrameAndAnalyze() {
    this.overlay.finalizeFrame();

    const frame = this.overlay.currentFrame();
    if (!frame) return;

    this.detectPhaseAnomalies(frame);
    this.detectPluginAnomalies(frame);
  }

  private detectPhaseAnomalies(frame: ULDEFrame) {
    for (const phase of frame.phases) {
      if (phase.duration > this.phaseErrorThreshold) {
        this.overlay.addDiagnostic({
          level: 'error',
          message: `Lifecycle phase "${phase.lifecyclePhase}" exceeded error threshold (${this.phaseErrorThreshold}ms): ${phase.duration.toFixed(1)}ms`,
          lifecyclePhase: phase.lifecyclePhase,
        });
      } else if (phase.duration > this.phaseWarnThreshold) {
        this.overlay.addDiagnostic({
          level: 'warn',
          message: `Lifecycle phase "${phase.lifecyclePhase}" exceeded warn threshold (${this.phaseWarnThreshold}ms): ${phase.duration.toFixed(1)}ms`,
          lifecyclePhase: phase.lifecyclePhase,
        });
      }
    }
  }

  private detectPluginAnomalies(frame: ULDEFrame) {
    for (const t of frame.pluginTimings) {
      if (t.duration > this.pluginErrorThreshold) {
        this.overlay.addDiagnostic({
          level: 'error',
          message: `Plugin "${t.pluginName}" in hook "${t.hookName}" exceeded error threshold (${this.pluginErrorThreshold}ms): ${t.duration.toFixed(1)}ms`,
          pluginName: t.pluginName,
          lifecyclePhase: t.lifecyclePhase,
        });
      } else if (t.duration > this.pluginWarnThreshold) {
        this.overlay.addDiagnostic({
          level: 'warn',
          message: `Plugin "${t.pluginName}" in hook "${t.hookName}" exceeded warn threshold (${this.pluginWarnThreshold}ms): ${t.duration.toFixed(1)}ms`,
          pluginName: t.pluginName,
          lifecyclePhase: t.lifecyclePhase,
        });
      }
    }
  }
}
