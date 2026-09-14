// src/ulde/viewer/panels/runtime-inspector/ulde-runtime-inspector-panel.ts

import { JsonPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { ULDERendererState } from '@ulde/types';
import { ULDERenderContext } from '@ulde/types/context';

@Component({
  selector: 'ulde-runtime-inspector-panel',
  imports: [JsonPipe],
  templateUrl: './ulde-runtime-inspector-panel.html',
  styleUrl: './ulde-runtime-inspector-panel.scss',
})
export class UldeRuntimeInspectorPanel {

  $rendererState = input<ULDERendererState | undefined>(undefined);

  $activeTab = signal<'ast' | 'layout' | 'sections' | 'toc' | 'anchors'>('ast');

  $astNodes = computed(() => this.$rendererState()?.renderContext?.ast ?? []);
  $layoutTree = computed(() =>
    this.$rendererState()?.renderContext?.layout ?? null
  );
  $sections = computed(() =>
    this.$astNodes().filter(n => n.type === 'section')
  );
  // sections = computed(() => this.$rendererState()?.renderContext?.sections ?? []);
  $toc = computed(() =>
    this.$astNodes().filter(n => n.type === 'toc')
    // .flat(n=> n.children?.filter(n=>n.type='toc')));
  );
  // toc = computed(() => this.$rendererState()?.renderContext?.toc ?? []);
  $anchors = computed(() =>
    this.$toc().filter(n => n.children?.filter(n => n.type==='anchor')));
  // anchors = computed(() => this.$rendererState()?.renderContext?.anchors ?? []);

  setTab(tab: 'ast' | 'layout' | 'sections' | 'toc' | 'anchors') {
    this.$activeTab.set(tab);
  }

  trackByIndex(i: number) {
    return i;
  }
}
