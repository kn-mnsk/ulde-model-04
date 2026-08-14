// src/engine/docs-engine.service.ts

import { Injectable } from '@angular/core';
import { ULDELifecycleService } from '../core/ulde-lifecycle.service';
import { ContentEngineService } from './content-engine.service';
import { LayoutEngineService } from './layout-engine.service';
import { InteractiveEngineService } from './interactive-engine.service';
import { ULDEPluginRegistryService } from '../core/ulde-plugin-registry.service';
import { ULDERuntimeService } from '../core/ulde-runtime.service';

@Injectable({
  providedIn: 'root',
})
export class DocsEngineService {


  constructor(
    private lifecycle: ULDELifecycleService,
    private content: ContentEngineService,
    private layout: LayoutEngineService,
    private interactive: InteractiveEngineService,
    private plugins: ULDEPluginRegistryService,
    private runtime: ULDERuntimeService
  ) { }

  async execute(pageId: string) {
    await this.init();          // init → load
    await this.loadPage(pageId); // load → render
    await this.renderPage(pageId); // render → hydrate
    await this.hydratePage(pageId); // hydrate → afterRender
    await this.afterRender();     // finalize frame
  }


  /** INIT Phase — System Boot
   * ULDE overlay shows “init” starting
   * Plugin hooks like onInit() run
   * ULDE records timings
   * No content is loaded yet
   */
  async init() {
    this.lifecycle.startPhase("init");
    await this.plugins.run("onInit", { phase: 'init' });
    this.lifecycle.endPhase("init");
  }

  /** LOAD Phase — Fetch Content + Layout
   * Markdown/MDX/raw content is loaded
   * Layout metadata is prepared
   * Plugins like content.frontmatter-normalizer run
   * ULDE overlay shows load duration
   * @param pageId
   */
  private async loadPage(pageId: string) {
    this.lifecycle.startPhase("load");
    const raw = await this.content.load(pageId);
    if (raw === undefined) throw new Error(`Invalid URL`);
    const layout = await this.layout.prepare(pageId);
    await this.plugins.run("onPageLoad", {
      phase: "load",
      pageId,
      rawContent: raw,
      layout
    });
    this.lifecycle.endPhase("load");
  }

  /** RENDER Phase - Transform + Layout
   * AST is generated
   * HTML is produced
   * Layout plugins (TOC, callouts, codeblock enhancers) run
   * ULDE overlay shows render timings
   * @param pageId
   */
  private async renderPage(pageId: string) {
    this.lifecycle.startPhase("render");

    const ast = await this.content.transform(pageId);
    const html = await this.layout.render(ast);

    await this.plugins.run("onBeforeRender", {
      phase: "render",
      pageId,
      ast,
      html
    });

    this.lifecycle.endPhase("render");
  }

  /** HYDRATE Phase — Activate Interactive Components
   * Angular components mount inside rendered HTML
   * Demo plugins (playgrounds, sandboxes) hydrate
   * ULDE overlay shows hydration timings
   * @param pageId
   */
  private async hydratePage(pageId: string) {
    this.lifecycle.startPhase("hydrate");

    await this.interactive.hydrate(pageId);
    await this.plugins.run("onAfterRender", {
      phase: "hydrate",
      pageId
    });

    this.lifecycle.endPhase("hydrate");
  }

  /** AFTER RENDER Phase — Finalize Frame + Overlay Update
   * ULDE runtime finalizes the frame
   * Overlay sparkline updates
   * Heatmap + timeline diagnostics run
   * Warnings appear if needed
   * @param pageId
   */
  private async afterRender() {

    this.lifecycle.startPhase("afterRender");

    this.runtime.finalizeFrameAndAnalyze(); // overlay + diagnostic

    this.lifecycle.endPhase("afterRender");

  }



}
