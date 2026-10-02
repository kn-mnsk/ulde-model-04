// src/app/demo/ulde-demo-01/ulde-demo-01.ts

import { AfterViewInit, Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';

import { ULDELifecycleService } from '@ulde/core';
import { ULDEPageContext, ULDERenderContext } from '@ulde/types/context';

import { ContentEngineService } from '@ulde/engine';
import { ULDERendererState } from '@ulde/types/renderer/ulde-renderer.types';
import { UldeViewer } from '@ulde/viewer';
import { isBrowser } from '../../global.utils/global.utils';



@Component({
  selector: 'app-ulde-demo-01',
  imports: [UldeViewer],
  templateUrl: './ulde-demo-01.html',
  styleUrl: './ulde-demo-01.scss',
})
export class UldeDemo01 implements AfterViewInit, OnInit {

  component = 'UldeDemo01';

  renderContext: ULDERenderContext | undefined = undefined;

  $pageId = signal<string>('docs/index'); // initila value

  $rendererState = signal<ULDERendererState>({
    modelId: 'ulde-demo-01',
    variantId: 'default',
    zoom: 1,
    rotation: { x: 0, y: 0, z: 0 },

    executionContext: undefined,
    // renderContext: undefined,
    // currentLifecyclePhase: undefined,
    // diagnostics: undefined,
    // frame: undefined,
  });

  // private md = new MarkdownIt();

  private async buildDemoPageContext(): Promise<ULDEPageContext | void> {

    // load markdown file
    const markdown = await this.contenEngine.load(this.$pageId());
    if (!markdown) return;

    const tokens = await this.contenEngine.transform(markdown);
    // const tokens = this.md.parse(markdown, {});

    return {
      pageId: this.$pageId(),
      source: {
        raw: markdown,
        tokens: tokens
      },
      meta: {},
    };
  }

  private async runUldeDemo(lifecycle: ULDELifecycleService) {
    const pageContext = await this.buildDemoPageContext();
    if (!pageContext) return undefined;

    const executionContext = await lifecycle.executeLifecycle(pageContext);
    // const renderContext = executionContext?.render;

    return executionContext;
  }


  @ViewChild('hostUldeViewerRef', { static: true }) hostUldeViewerRef!: ElementRef<HTMLElement>;
  constructor(
    private contenEngine: ContentEngineService,
    private lifecycle: ULDELifecycleService) { }

  async ngOnInit() {
    // this.renderContext = await this.runUldeDemo(this.lifecycle);
  }

  async ngAfterViewInit() {
    if (!isBrowser()) return;

    const executeContext = await this.runUldeDemo(this.lifecycle);
    if (!executeContext) {
      console.error('Error: [UldeDemo01] Render context is not available.');
      return;
    }

    this.$rendererState.update(state => ({ ...state, executeContext }));

    console.log(`Log: [${this.component}] ngAfterViewInit\n rendererState:`, this.$rendererState());

  }

  onViewerStateChange(state: ULDERendererState) {

    console.log(`Log: [${this.component}] onViewerStateChanged state=`, state);
    // sync UI or analytics
  }

  onError(error: Error) {
    console.error(`Log: [${this.component}] onError error=`, JSON.stringify(error, null, 2));

  }

}
