// src/ulde/viewer/panels/diagnostics/ulde-diagnostics-panel.ts

import { Component, input, output, signal } from '@angular/core';
import { ULDEDiagnostic } from '@ulde/types/diagnostics';

@Component({
  selector: 'ulde-diagnostics-panel',
  standalone: true,
  templateUrl: './ulde-diagnostics-panel.html',
  styleUrl: './ulde-diagnostics-panel.scss',
})
export class UldeDiagnosticsPanel {

  $diagnostics = input<ULDEDiagnostic[]>([]);
  $highlight = output<string>();

  $expanded = signal(true);

  toggle() {
    this.$expanded.update(v => !v);
  }

  trackDiag(i: number, d: ULDEDiagnostic) {
    return `${d.level}-${d.message}-${i}`;
  }


  onHighlight(msg: string) {
    this.$highlight.emit(msg);
  }

}
