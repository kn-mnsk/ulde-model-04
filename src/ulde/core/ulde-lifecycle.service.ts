// src/core/ulde/ulde-lifecycle.service.ts
import { Injectable } from '@angular/core';
import { ULDEOverlayService } from './ulde-overlay/ulde-overlay.service';
import { ULDEPluginRegistryService } from './ulde-plugin-registry.service';
import { ULDELifecycleName } from '../types/ulde.types';

@Injectable({ providedIn: 'root' })
export class ULDELifecycleService {
  constructor(
    private overlay: ULDEOverlayService,
    private plugins: ULDEPluginRegistryService
  ) { }

  /**
   * Start a lifecycle phase.
   */
  startPhase(lifecycleName: ULDELifecycleName) {
    this.overlay.startPhase(lifecycleName);
  }

  /**
   * End a lifecycle phase.
   */
  endPhase(lifecycleName: ULDELifecycleName) {
    this.overlay.endPhase(lifecycleName);
  }

  /**
   * Run a lifecycle phase with plugin hooks.
   */
  async runPhase(
    lifecycleName: ULDELifecycleName,
    hookName?: keyof ULDEPluginRegistryService['hookMap'],
    ctx?: any
  ) {
    try {
      this.startPhase(lifecycleName);

      if (hookName) {
        await this.plugins.run(hookName, ctx);
      }

      this.endPhase(lifecycleName);
    } catch (err) {
      this.overlay.addDiagnostic({
        level: 'error',
        message: `Error in phase "${lifecycleName}": ${String(err)}`,
        lifecycleName: lifecycleName
      });
    }
  }

  /**
   * Full lifecycle execution for a page.
   */
  async executeLifecycle(pageId: string, contexts: any) {
    // INIT
    await this.runPhase('init', 'onInit');

    // LOAD
    await this.runPhase('load', 'onPageLoad', contexts.load);

    // RENDER
    await this.runPhase('render', 'onBeforeRender', contexts.render);

    // HYDRATE
    await this.runPhase('hydrate', 'onAfterRender', contexts.hydrate);

    // AFTER RENDER
    this.startPhase('afterRender');
    this.overlay.finalizeFrame();
    this.endPhase('afterRender');
  }
}
