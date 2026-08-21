// /src/ulde/core/ulde-plugin-registry.service.ts
import { Injectable } from '@angular/core';
import { ULDEOverlayService } from '@ulde/core';
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';
import { ULDEPlugin, ULDEPluginHooks, ULDEPluginKind } from '@ulde/types/plugin';
import { ULDEPluginTiming } from '@ulde/types/timing';

import { createUldeStringPluginRegistry } from '@ulde/core';

@Injectable({ providedIn: 'root' })
export class ULDEPluginRegistryService {

  private plugins: ULDEPlugin[] = [];

  /**
   * Hook map for lifecycle service convenience.
   */
  hookMap: { [K in keyof ULDEPluginHooks]: K } = {
    onInit: 'onInit',
    onPageLoad: 'onPageLoad',
    onBeforeRender: 'onBeforeRender',
    onAfterRender: 'onAfterRender',
    onDestroy: 'onDestroy',
  };

  constructor(private overlay: ULDEOverlayService) {

    // plugins registry
    const plugins = createUldeStringPluginRegistry();
    plugins.forEach(p => {
      this.register(p);
    })
  }

  /**
   * Register a plugin.
   */
  register(plugin: ULDEPlugin) {
    if (plugin.enabled === false) return;

    this.plugins.push(plugin);
    // this.plugins.sort((a, b) => a.name.localeCompare(b.name)); // deterministic order
  }

  /**
   * Run a specific hook across all plugins.
   */
  async run(
    hookName: keyof ULDEPluginHooks,
    ctx?: { lifecyclePhase?: ULDELifecyclePhase } & Record<string, any>,
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const hook = plugin.hooks[hookName];
      if (!hook) continue;

      const start = performance.now();

      try {
        await hook(ctx as any);
      } catch (err) {
        this.overlay.addDiagnostic({
          level: 'error',
          message: `Plugin "${plugin.name}" failed in hook "${hookName}": ${String(err)}`,
          pluginName: plugin.name,
          lifecyclePhase: ctx?.lifecyclePhase,
        });
      }

      const end = performance.now();

      const timing: ULDEPluginTiming = {
        pluginName: plugin.name,
        pluginKind: plugin.pluginKind as ULDEPluginKind,
        hookName,
        lifecyclePhase: ctx?.lifecyclePhase ?? 'init',
        duration: end - start,
      };

      this.overlay.recordPluginTiming(timing);
    }
  }

  /**
   * Destroy all plugins (called on app teardown).
   */
  async destroyAll() {
    for (const plugin of this.plugins) {
      const hook = plugin.hooks.onDestroy;
      if (!hook) continue;

      const start = performance.now();

      try {
        await hook();
      } catch (err) {
        this.overlay.addDiagnostic({
          level: 'error',
          message: `Plugin "${plugin.name}" failed in onDestroy: ${String(err)}`,
          pluginName: plugin.name,
        });
      }

      const end = performance.now();

      this.overlay.recordPluginTiming({
        pluginName: plugin.name,
        pluginKind: plugin.pluginKind,
        hookName: 'onDestroy',
        lifecyclePhase: 'afterRender',
        duration: end - start,
      });
    }
  }

  /**
   * Get all registered plugins.
   */
  list() {
    return [...this.plugins];
  }
}
