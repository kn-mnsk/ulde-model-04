// src/ulde/core/ulde-plugin-registry.service.ts

import { Injectable } from '@angular/core';
import { ULDEOverlayService } from '@ulde/core';
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';
import { ULDEPlugin, ULDEPluginTiming } from '@ulde/types/plugin';

import { ULDE_PLUGIN_REGISTRY } from '@ulde/plugins/registry'; // updated registry

@Injectable({ providedIn: 'root' })
export class ULDEPluginRegistryService {

  /**
   * All instantiated plugins (flattened from registry).
   */
  private instances: ULDEPlugin[] = [];

  constructor(private overlay: ULDEOverlayService) {
    this.loadPlugins();
  }

  /**
   * Instantiate all plugins from the phase‑grouped registry.
   */
  loadPlugins() {
    this.instances = Object.values(ULDE_PLUGIN_REGISTRY)
      .flat()
      .map(PluginClass => new PluginClass())
      .filter(p => p.enabled !== false);
  }

  /**
   * Run all plugins assigned to a lifecycle phase.
   */
  async runPhase(
    phase: ULDELifecyclePhase,
    ctx: Record<string, any> = {}
  ): Promise<void> {

    const plugins = ULDE_PLUGIN_REGISTRY[phase] || [];

    for (const PluginClass of plugins) {
      const plugin = this.instances.find(p => p instanceof PluginClass);
      if (!plugin) continue;

      const start = performance.now();

      try {
        await plugin.run?.({
          ...ctx,
          lifecyclePhase: phase,
        });
      } catch (err) {
        this.overlay.addDiagnostic({
          level: 'error',
          message: `Plugin "${plugin.pluginName}" failed in phase "${phase}": ${String(err)}`,
          pluginName: plugin.pluginName,
          lifecyclePhase: phase,
        });
      }

      const end = performance.now();

      const timing: ULDEPluginTiming = {
        pluginName: plugin.pluginName,
        pluginKind: plugin.pluginKind,
        hookName: 'run',
        lifecyclePhase: phase,
        duration: end - start,
      };

      this.overlay.recordPluginTiming(timing);
    }
  }

  /**
   * Destroy all plugins (called at end of lifecycle).
   */
  async destroyAll() {
    for (const plugin of this.instances) {
      if (!plugin.destroy) continue;

      const start = performance.now();

      try {
        await plugin.destroy();
      } catch (err) {
        this.overlay.addDiagnostic({
          level: 'error',
          message: `Plugin "${plugin.pluginName}" failed in destroy(): ${String(err)}`,
          pluginName: plugin.pluginName,
          lifecyclePhase: 'afterRender',
        });
      }

      const end = performance.now();

      this.overlay.recordPluginTiming({
        pluginName: plugin.pluginName,
        pluginKind: plugin.pluginKind,
        hookName: 'destroy',
        lifecyclePhase: 'afterRender',
        duration: end - start,
      });
    }

    this.instances = [];
  }

  /**
   * List all instantiated plugins.
   */
  list() {
    return [...this.instances];
  }
}








// import { Injectable } from '@angular/core';
// import { ULDEOverlayService } from '@ulde/core';
// import { ULDELifecyclePhase } from '@ulde/types/lifecycle';
// import { ULDEPlugin, ULDEPluginHooks, ULDEPluginKind } from '@ulde/types/plugin';
// import { ULDEPluginTiming } from '@ulde/types/timing';

// import { createUldeStringPluginRegistry } from '@ulde/plugins/registry';

// @Injectable({ providedIn: 'root' })
// export class ULDEPluginRegistryService {

//   private plugins: ULDEPlugin[] = [];

//   /**
//    * Hook map for lifecycle service convenience.
//    */
//   hookMap: { [K in keyof ULDEPluginHooks]: K } = {
//     onInit: 'onInit',
//     onPageLoad: 'onPageLoad',
//     onBeforeRender: 'onBeforeRender',
//     onAfterRender: 'onAfterRender',
//     onDestroy: 'onDestroy',
//   };

//   constructor(private overlay: ULDEOverlayService) {

//     // plugins registry
//     const plugins = createUldeStringPluginRegistry();
//     plugins.forEach(p => {
//       this.register(p);
//     })
//   }

//   /**
//    * Register a plugin.
//    */
//   register(plugin: ULDEPlugin) {
//     if (plugin.enabled === false) return;

//     this.plugins.push(plugin);
//     // this.plugins.sort((a, b) => a.pluginKind.localeCompare(b.pluginKind)); // deterministic order
//   }

//   /**
//    * Run a specific hook across all plugins.
//    */
//   async run(
//     hookName: keyof ULDEPluginHooks,
//     ctx?: { lifecyclePhase?: ULDELifecyclePhase } & Record<string, any>,
//   ): Promise<void> {
//     for (const plugin of this.plugins) {
//       const hook = plugin.hooks[hookName];
//       if (!hook) continue;

//       const start = performance.now();

//       try {
//         await hook(ctx as any);
//       } catch (err) {
//         this.overlay.addDiagnostic({
//           level: 'error',
//           message: `Plugin "${plugin.pluginName}" failed in hook "${hookName}": ${String(err)}`,
//           pluginName: plugin.pluginKind,
//           lifecyclePhase: ctx?.lifecyclePhase,
//         });
//       }

//       const end = performance.now();

//       const timing: ULDEPluginTiming = {
//         pluginName: plugin.pluginName,
//         pluginKind: plugin.pluginKind,
//         hookName,
//         lifecyclePhase: ctx?.lifecyclePhase ?? 'init',
//         duration: end - start,
//       };

//       this.overlay.recordPluginTiming(timing);
//     }
//   }

//   /**
//    * Destroy all plugins (called on app teardown).
//    */
//   async destroyAll() {
//     for (const plugin of this.plugins) {
//       const hook = plugin.hooks.onDestroy;
//       if (!hook) continue;

//       const start = performance.now();

//       try {
//         await hook();
//       } catch (err) {
//         this.overlay.addDiagnostic({
//           level: 'error',
//           message: `Plugin "${plugin.pluginName}" failed in onDestroy: ${String(err)}`,
//           pluginName: plugin.pluginKind,
//         });
//       }

//       const end = performance.now();

//       this.overlay.recordPluginTiming({
//         pluginName: plugin.pluginName,
//         pluginKind: plugin.pluginKind,
//         hookName: 'onDestroy',
//         lifecyclePhase: 'afterRender',
//         duration: end - start,
//       });
//     }

//     this.plugins = [];

//   }

//   /**
//    * Get all registered plugins.
//    */
//   list() {
//     return [...this.plugins];
//   }
// }
