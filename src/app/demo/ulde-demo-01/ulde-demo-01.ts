import { Component, signal, AfterViewInit, OnInit } from '@angular/core';

import MarkdownIt from 'markdown-it';
import { ULDEPageContext, ULDERenderContext } from '@ulde/types/context';
import { ULDELifecycleService } from '@ulde/core';

import { UldeViewer } from '@ulde/viewer';
import { ULDERendererState } from '@ulde/types/renderer/ulde-renderer.types';
import { isBrowser } from '../../global.utils/global.utils';

const demoMarkdown = `
# ULDE Demo

This is an **ULDE** end-to-end demo.

## TOC & Anchors

- This page has auto TOC
- Headings get anchors

## Demo Block

\`\`\`demo id=hello-ulde
console.log("Hello ULDE");
\`\`\`

## Diagnostics

This section will show ULDE diagnostics at the bottom.
`;

@Component({
  selector: 'app-ulde-demo-01',
  imports: [UldeViewer],
  templateUrl: './ulde-demo-01.html',
  styleUrl: './ulde-demo-01.scss',
})
export class UldeDemo01 implements AfterViewInit, OnInit {

  renderContext: ULDERenderContext | undefined = undefined;

  $rendererState = signal<ULDERendererState>({
    modelId: 'ulde-demo-01',
    variantId: 'default',
    zoom: 1,
    rotation: { x: 0, y: 0, z: 0 },
    renderContext: undefined,
    currentLifecyclePhase: undefined,
    diagnostics: undefined,
    frame: undefined,
  });

  private md = new MarkdownIt();

  private buildDemoPageContext(): ULDEPageContext {
    const tokens = this.md.parse(demoMarkdown, {});

    return {
      pageId: 'ulde-demo-01',
      raw: demoMarkdown,
      token: tokens,
      meta: {},
    };
  }

  private async runUldeDemo(lifecycle: ULDELifecycleService) {
    const pageContext = this.buildDemoPageContext();
    const renderContext = await lifecycle.executeLifecycle(pageContext);

    return renderContext;
  }


  constructor(private lifecycle: ULDELifecycleService) { }

  async ngOnInit() {
    // this.renderContext = await this.runUldeDemo(this.lifecycle);
  }

  async ngAfterViewInit() {
    if (!isBrowser()) return;

    const renderContext = await this.runUldeDemo(this.lifecycle);
    if (!renderContext) {
      console.error('Error: [UldeDemo01] Render context is not available.');
      return;
    }

    this.$rendererState.update(state => ({...state, renderContext}));

    console.log('Log: [ULDEDemo01] ngAfterViewInit\n rendererState:', this.$rendererState());

  }

  onViewerStateChange(state: ULDERendererState) {

    console.log(`Log: [UldeDemo01] onViewerStateChanged state=`, state);
    // sync UI or analytics
  }

  onError(error: Error) {
    console.error(`Log: [UldeDemo01] onError error=`, JSON.stringify(error, null, 2));

  }

}
