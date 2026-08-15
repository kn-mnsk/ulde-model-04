// src/ulde/core/ulde-lifecycle.service.ts
import { Injectable } from '@angular/core';
import {
  ULDELifecyclePhase,
  ULDEPageContext,
  ULDERenderContext,
} from '../types/ulde.types';
import { ULDEOverlayService } from './ulde-overlay/ulde-overlay.service';
import { ULDEPluginRegistry } from './ulde-plugin-registry.service';
import { ULDERuntimeService } from './ulde-runtime.service';

@Injectable({ providedIn: 'root' })
export class ULDELifecycleService {
  constructor(
    private overlay: ULDEOverlayService,
    private plugins: ULDEPluginRegistry,
    private runtime: ULDERuntimeService,
  ) {}

  startPhase(lifecyclePhase: ULDELifecyclePhase) {
    this.overlay.startPhase(lifecyclePhase);
  }

  endPhase(lifecyclePhase: ULDELifecyclePhase) {
    this.overlay.endPhase(lifecyclePhase);
  }

  async runPhase(
    lifecyclePhase: ULDELifecyclePhase,
    hookName?: keyof ULDEPluginRegistry['hookMap'],
    ctx?: ULDEPageContext | ULDERenderContext | Record<string, any>,
  ) {
    try {
      this.startPhase(lifecyclePhase);

      if (hookName) {
        await this.plugins.run(hookName, {
          ...(ctx || {}),
          lifecyclePhase,
        });
      }

      this.endPhase(lifecyclePhase);
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
  async executeLifecycle(
    pageContext: ULDEPageContext,
    renderContextBuilder: () => Promise<ULDERenderContext>,
  ) {
    // INIT
    await this.runPhase('init', 'onInit');

    // LOAD
    await this.runPhase('load', 'onPageLoad', pageContext);

    // RENDER
    const renderContext = await renderContextBuilder();
    await this.runPhase('render', 'onBeforeRender', renderContext);

    // HYDRATE
    await this.runPhase('hydrate', 'onAfterRender', renderContext);

    // AFTER RENDER
    this.startPhase('afterRender');
    this.runtime.finalizeFrameAndAnalyze();
    this.endPhase('afterRender');
  }
}
