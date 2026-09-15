// src/ulde/viewer/panels/runtime-inspector/ulde-runtime-inspector-panel.ts

import { JsonPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { ULDERendererState } from '@ulde/types';
import { ULDEAstNode } from '@ulde/types/context';

@Component({
  selector: 'ulde-runtime-inspector-panel',
  imports: [JsonPipe],
  templateUrl: './ulde-runtime-inspector-panel.html',
  styleUrl: './ulde-runtime-inspector-panel.scss',
})
export class UldeRuntimeInspectorPanel {

  $rendererState = input<ULDERendererState | undefined>(undefined);

  $activeTab = signal<'ast' | 'layout' | 'sections' | 'toc' | 'anchors' | 'frame'>('ast');

  $astNodes = computed(() => this.$rendererState()?.renderContext?.ast ?? []);
  $layout = computed(() => this.$rendererState()?.renderContext?.layout ?? null);
  $frame = computed(() => this.$rendererState()?.frame ?? null);

  $sections = computed(() => this.extractSections(this.$astNodes()));
  $toc = computed(() => this.extractToc(this.$astNodes()));
  $anchors = computed(() => this.extractAnchors(this.$astNodes()));

  private extractSections(ast: ULDEAstNode[]) {
    const result: { id: string; depth: number }[] = [];

    function walk(node: ULDEAstNode) {
      if (node.type === 'section') {
        result.push({
          id: node.meta?.['id'] ?? '',
          depth: node.meta?.['depth'],
        });
      }

      node.children?.forEach(child => walk(child));
    }

    ast.forEach(n => walk(n));
    return result;
  }

  private extractToc(ast: ULDEAstNode[]) {
    const tocs: { href: string; label: string }[] = [];

    function walk(node: ULDEAstNode) {
      if (node.type === 'link') {
        tocs.push({
          href: node.meta?.['href'],
          label: node.children?.filter(n => n.type === 'text').map(n => n.value).join('') ?? ''
        });
      }

      node.children?.forEach(child => walk(child));
    }

    ast.filter(n => n.type === 'toc').forEach(n => walk(n));
    return tocs;
  }

  private extractAnchors(ast: ULDEAstNode[]) {

    console.log(`Log: [UldeRuntimeInspectorPanel] extractAnchors`);

    const anchors: { id: string; depth: number, text: string }[] = [];
    let depth: number = 0;

    function walk(children: ULDEAstNode[] | undefined) {

      if (children === undefined) return;

      let id: string ='';
      let text: string ='';

      children.forEach((child, index) => {

        switch (child.type) {
          case 'anchor': {
            id = child.meta?.['id'] ?? '';
            break;
          }
          case 'text': {
            text = child.value ?? '';
            break;
          }
        };

        if (id !== '' && text !== '') {
          anchors.push({
            id: id,
            depth: depth,
            text: text
          });

          walk(child.children);
        }

      });

    }

    ast.filter(n => n.type === 'section').forEach(n => n.children?.filter(n => n.type === 'heading').forEach(n => {
      depth = n.depth ?? -1;
      walk(n.children);
    }));

    return anchors;
  }

  setTab(tab: 'ast' | 'layout' | 'sections' | 'toc' | 'anchors' | 'frame') {
    this.$activeTab.set(tab);
  }

  track(i: number) { return i; }


}
