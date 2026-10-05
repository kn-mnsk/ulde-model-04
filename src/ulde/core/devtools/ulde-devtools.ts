// src/ulde/core/devtools/ulde-devtools.ts

import { DatePipe, DecimalPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, output, signal, Signal, computed } from '@angular/core';
import { UldeDevToolsDiagnosticsPanel, UldeDevtoolsFrameTimelinePanel, UldeDevtoolsPluginTimelinePanel, UldeDevtoolsRuntimeInspectorPanel, ULDEDevtoolsService } from '@ulde/core/devtools';
import { ULDERendererState } from '@ulde/types';
import { ULDEDevtoolsSnapshot, ULDEDevToolsTab } from '@ulde/types/devtools';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';
import { ULDEFrame } from '@ulde/types/frame';
import { ULDELifecyclePhaseTiming } from '@ulde/types/lifecycle';
import { isBrowser } from '../../../app/global.utils/global.utils';

@Component({
  selector: 'ulde-devtools',
  imports: [
    DecimalPipe, DatePipe, JsonPipe,
    UldeDevToolsDiagnosticsPanel,
    UldeDevtoolsFrameTimelinePanel,
    UldeDevtoolsRuntimeInspectorPanel,
    UldeDevtoolsPluginTimelinePanel,

  ],
  templateUrl: './ulde-devtools.html',
  styleUrls: ['./ulde-devtools.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ULDEDevtools {

  $rendererState = input<ULDERendererState>()

  $highlight = output<string>();

  // Declare signals
  // $store = signal<any | null>(null);

  // $snapshot = signal<ULDEDevtoolsSnapshot | undefined>(undefined);
  // $snapshot = signal<any | undefined>(undefined);
  $snapshot = computed(() => this.$rendererState()?.devtoolsSnapshot);
  // $snapshot!: Signal<ULDEDevtoolsSnapshot>;
  // snapshot: ULDEDevtoolsSnapshot | undefined = undefined;
  $store!: typeof this.devtoolsService.$store;

  $visible!: typeof this.devtoolsService.$visible;
  $pinned!: typeof this.devtoolsService.$pinned;
  $opacity!: typeof this.devtoolsService.$opacity;

  thresholds!: typeof this.devtoolsService.thresholds;

  // $activeTab = signal<ULDEDevToolsTab>('timeline');
  $activeTab = signal<ULDEDevToolsTab>('diagnostics');

  selectTab(tab: ULDEDevToolsTab) {
    this.$activeTab.set(tab);
    // this.devtoolsService.$reloadComputedSugnals.update(n => n+1);
  }

  constructor(
    private devtoolsService: ULDEDevtoolsService,
  ) {

    this.$store = devtoolsService.$store;

    this.$visible = devtoolsService.$visible;
    this.$pinned = devtoolsService.$pinned;
    this.$opacity = devtoolsService.$opacity;

    this.thresholds = devtoolsService.thresholds;

    effect(() => {
      if (!this.$rendererState()) return;
      console.log(`Log: [UldeDevTools] effect() $rendererState:\n`, this.$rendererState());

    })

  }

  // UI actions
  toggleDevTools() {
    this.devtoolsService.toggle();
  }

  pinDevTools() {
    this.devtoolsService.pin();
  }

  setDevToolsOpacity(value: number) {
    this.devtoolsService.setOpacity(value);
  }

  // Phase selection (for filtering plugin timings)
  selectPhase(phase: ULDELifecyclePhaseTiming) {
    this.devtoolsService.$currentLifecyclePhaseTiming.set(phase);
  }

  clearPhaseSelection() {
    this.devtoolsService.$currentLifecyclePhaseTiming.set(null);
  }

  // Frame selection (for timeline/sparkline)
  selectFrame(frame: ULDEFrame) {
    this.devtoolsService.$currentFrame.set(frame);
  }


  trackDiag(i: number, d: ULDEDiagnostic) {
    return `${d.level}-${d.message}-${i}`;
  }

  onHighlight(msg: string) {
    this.$highlight.emit(msg);
  }
}
