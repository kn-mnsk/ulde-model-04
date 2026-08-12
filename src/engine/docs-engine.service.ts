// src/engine/docs-engine.service.ts

import { Injectable } from '@angular/core';
import { ULDELifecycleService } from '../core/ulde/ulde-lifecycle.service';
import { ContentEngineService } from './content-engine.service';
import { LayoutEngineService } from './layout-engine.service';
import { InteractiveEngineService } from './interactive-engine.service';

@Injectable({
  providedIn: 'root',
})
export class DocsEngineService {


  constructor(
    private ulde: ULDELifecycleService,
    private content: ContentEngineService,
    private layout: LayoutEngineService,
    private interactive: InteractiveEngineService,
  ) { }

  async navigateTo(pageId: string) {
    await this.runLoadPhase(pageId);
    await this.runRenderPhase(pageId);
    await this.runHydratePhase(pageId);
    await this.runAfterRenderPhase(pageId);
  }

  async init() {
    this.ulde.startPhase("init");
    await this.plugins.run("onInit");
    this.ulde.endPhase("init");
  }

  private async runLoadPhase(pageId: string) {
    this.ulde.startPhase("load");
    const ast = await this.content.load(pageId);
    const html = await this.layout.prepare(pageId);
    await this.plugins.run("onPageLoad", { pageId, ast, html });
    this.ulde.endPhase("load");
  }

  private async runRenderPhase(pageId: string) {
    this.ulde.startPhase("render");
    const ast = await this.content.transform(pageId);
    const html = await this.layout.render(ast);
    await this.plugins.run("onBeforeRender", { pageId, ast, html });
    this.ulde.endPhase("render");
  }

  private async runHydratePhase(pageId: string) {
    this.ulde.startPhase("hydrate");
    await this.interactive.hydrate(pageId);
    await this.plugins.run("onAfterRender");
    this.ulde.endPhase("hydrate");
  }

  private async runAfterRenderPhase(pageId: string) {

    this.ulde.startPhase("afterRender");

    /** finalize */

    /** overlay */

    this.ulde.endPhase("afterRender");

  }



}
