// src/core/ulde/ulde-lifecycle.service.ts
import { Injectable } from '@angular/core';
import { ULDEOverlayService } from './ulde-overlay/ulde-overlay.service';
import { ULDEPluginRegistryService } from './ulde-plugin-registry.service';

export type ULDEPhaseName =
  | 'init'
  | 'load'
  | 'render'
  | 'hydrate'
  | 'afterRender';

@Injectable({ providedIn: 'root' })
export class ULDELifecycleService {
  constructor(
    private overlay: ULDEOverlayService,
    private plugins: ULDEPluginRegistryService
  ) { }

  /**
   * Start a lifecycle phase.
   */
  startPhase(name: ULDEPhaseName) {
    this.overlay.startPhase(name);
  }

  /**
   * End a lifecycle phase.
   */
  endPhase(name: ULDEPhaseName) {
    this.overlay.endPhase(name);
  }

  /**
   * Run a lifecycle phase with plugin hooks.
   */
  async runPhase(
    name: ULDEPhaseName,
    hookName?: keyof ULDEPluginRegistryService['hookMap'],
    ctx?: any
  ) {
    try {
      this.startPhase(name);

      if (hookName) {
        await this.plugins.run(hookName, ctx);
      }

      this.endPhase(name);
    } catch (err) {
      this.overlay.addDiagnostic({
        level: 'error',
        message: `Error in phase "${name}": ${String(err)}`,
        phase: name
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
