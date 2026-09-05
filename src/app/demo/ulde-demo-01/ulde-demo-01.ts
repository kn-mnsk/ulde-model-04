import { Component, signal, AfterViewInit, OnInit, ViewChild, ElementRef } from '@angular/core';

import { ULDEPageContext, ULDERenderContext } from '@ulde/types/context';
import { ULDELifecycleService } from '@ulde/core';

import { UldeViewer } from '@ulde/viewer';
import { ULDERendererState } from '@ulde/types/renderer/ulde-renderer.types';
import { isBrowser } from '../../global.utils/global.utils';
import { ContentEngineService } from '@ulde/engine';



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
    renderContext: undefined,
    currentLifecyclePhase: undefined,
    diagnostics: undefined,
    frame: undefined,
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
      raw: markdown,
      token: tokens,
      meta: {},
    };
  }

  private async runUldeDemo(lifecycle: ULDELifecycleService) {
    const pageContext = await this.buildDemoPageContext();
    if (!pageContext) return undefined;
    const renderContext = await lifecycle.executeLifecycle(pageContext);

    return renderContext;
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

    const renderContext = await this.runUldeDemo(this.lifecycle);
    if (!renderContext) {
      console.error('Error: [UldeDemo01] Render context is not available.');
      return;
    }

    this.$rendererState.update(state => ({ ...state, renderContext }));

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
