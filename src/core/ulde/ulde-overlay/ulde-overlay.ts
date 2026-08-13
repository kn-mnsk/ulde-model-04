import { Component, signal, Signal, WritableSignal } from '@angular/core';
import { ULDEPhaseName } from '../ulde-lifecycle.service';
import { ULDEPhase, ULDEPluginTiming, ULDEFrame, ULDEDiagnostic, ULDEOverlayService } from './ulde-overlay.service';

@Component({
  selector: 'app-ulde-overlay',
  imports: [],
  templateUrl: './ulde-overlay.html',
  styleUrl: './ulde-overlay.scss',
})
export class UldeOverlay {

  phases!: Signal<ULDEPhase[]>;
  currentPhase!: Signal<ULDEPhase | null>;
  pluginTimings!: Signal<ULDEPluginTiming[]>;
  frames!: Signal<ULDEFrame[]>;
  currentFrame!: Signal<ULDEFrame | null>;
  diagnostics = signal<ULDEDiagnostic[]>([]);

  constructor(
    private store: ULDEOverlayService
  ) {
    this.phases = this.store.phases;
    this.currentPhase = this.store.currentPhase;
    this.pluginTimings = this.store.pluginTimings;
    this.frames = this.store.frames;
    this.diagnostics = this.store.diagnostics;
  }


}
