import { Injectable } from '@angular/core';
import { ULDEOverlayService } from './ulde-overlay/ulde-overlay.service';
import { ULDEPlugin, ULDEPluginHooks, ULDELifecyclePhase, ULDEPluginContext} from '../types/ulde.types';

@Injectable({ providedIn: 'root' })
export class ULDEPluginRegistryService {
  private plugins: ULDEPlugin[] = [];

  /**
   * Hook map for lifecycle service convenience.
   */
  hookMap = {
    onInit: 'onInit',
    onPageLoad: 'onPageLoad',
    onBeforeRender: 'onBeforeRender',
    onAfterRender: 'onAfterRender',
    onDestroy: 'onDestroy'
  } as const;

  constructor(private overlay: ULDEOverlayService) { }

  /**
   * Register a plugin.
   */
  register(plugin: ULDEPlugin) {
    if (!plugin.enabled && plugin.enabled !== undefined) return;

    this.plugins.push(plugin);
    this.plugins.sort((a, b) => a.pluginTitle.localeCompare(b.pluginTitle)); // deterministic order
  }

  /**
   * Run a specific hook across all plugins.
   */
  async run(
    hookName: keyof ULDEPluginHooks,
    ctx: ULDEPluginContext
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const hook = plugin.hooks[hookName];
      if (!hook) continue;

      const start = performance.now();

      try {
        await hook(ctx);
      } catch (err) {
        this.overlay.addDiagnostic({
          level: 'error',
          message: `Plugin "${plugin.pluginTitle}" failed in hook "${hookName}": ${String(err)}`,
          pluginTitle: plugin.pluginTitle
        });
      }

      const end = performance.now();

      this.overlay.recordPluginTiming({
        pluginTitle: plugin.pluginTitle,
        hookName,
        pluginPhase: ctx?.pluginPhase ?? 'unknown',
        duration: end - start
      });
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
          message: `Plugin "${plugin.pluginTitle}" failed in onDestroy: ${String(err)}`,
          pluginTitle: plugin.pluginTitle
        });
      }

      const end = performance.now();

      this.overlay.recordPluginTiming({
        pluginTitle: plugin.pluginTitle,
        hookName: 'onDestroy',
        pluginPhase: 'destroy',
        duration: end - start
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
