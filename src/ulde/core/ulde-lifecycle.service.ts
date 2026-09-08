// src/ulde/core/ulde-lifecycle.service.ts

import { Injectable } from '@angular/core';
import { ULDEPluginRegistryService, ULDERuntimeService } from '@ulde/core';
import { ULDEOverlayService } from '@ulde/core/overlay';
import { ULDEPageContext, ULDERenderContext, } from '@ulde/types/context';
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';

import { renderUldeAstToHtml, ULDERenderContextBuilderService } from '@ulde/engine';

@Injectable({ providedIn: 'root' })
export class ULDELifecycleService {

  constructor(
    private overlay: ULDEOverlayService,
    private pluginRegistry: ULDEPluginRegistryService,
    private runtime: ULDERuntimeService,
    private renderContextBuilder: ULDERenderContextBuilderService,
  ) { }

  startLifecyclePhase(lifecyclePhase: ULDELifecyclePhase) {
    this.overlay.startPhase(lifecyclePhase);
  }

  endLifecyclePhase(lifecyclePhase: ULDELifecyclePhase) {
    this.overlay.endPhase(lifecyclePhase);
  }

  async runPluginByLifecyclePhase(
    lifecyclePhase: ULDELifecyclePhase,
    hookName?: keyof ULDEPluginRegistryService['hookMap'],
    ctx?: ULDEPageContext | ULDERenderContext | Record<string, any>,
  ) {
    try {
      this.startLifecyclePhase(lifecyclePhase);

      if (hookName) {
        await this.pluginRegistry.run(hookName, {
          ...(ctx || {}),
          lifecyclePhase,
        });
      }

      this.endLifecyclePhase(lifecyclePhase);
    } catch (err) {
      this.overlay.addDiagnostic({
        level: 'error',
        message: `Error in phase "${lifecyclePhase}": ${String(err)}`,
        lifecyclePhase,
      });
    }
  }

  /**
   * Full lifecycle execution for a page.
   */
  async executeLifecycle(pageContext: ULDEPageContext): Promise<ULDERenderContext> {

    this.pluginRegistry.loadPlugins();

    // INIT
    await this.runPluginByLifecyclePhase('init', 'onInit');

    // LOAD
    await this.runPluginByLifecyclePhase('load', 'onPageLoad', pageContext);

    // RENDER
    const renderContext = await this.renderContextBuilder.build(pageContext);
    await this.runPluginByLifecyclePhase('render', 'onBeforeRender', renderContext);

    renderContext.html = renderUldeAstToHtml(renderContext.ast);

    // HYDRATE
    await this.runPluginByLifecyclePhase('hydrate', 'onAfterRender', renderContext);

    // AFTER RENDER
    // this.startLifecyclePhase('afterRender');

    this.pluginRegistry.destroyAll();

    this.runtime.finalizeFrameAndAnalyze();
    // this.endLifecyclePhase('afterRender');

    return renderContext;
  }
}
