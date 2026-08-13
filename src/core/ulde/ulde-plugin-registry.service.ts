import { Injectable } from '@angular/core';
import { ULDEOverlayService } from './ulde-overlay/ulde-overlay.service';
import { ULDEPhaseName } from './ulde-lifecycle.service';
import { SafeHtml } from '@angular/platform-browser';

export interface DocsPlugin {
  name: string;
  version?: string;
  description?: string;
  enabled?: boolean;
  hooks: PluginHooks;
}

export interface ULDEPageContext  {
  pageId: string;
  route: string;
  frontmatter: Record<string, any>;
  rawContent: string;
}

export interface ULDEPluginContext {
  phase: ULDEPhaseName
  pageId?: string;
  rawContent?: string;
  ast?: any;
  html?: string | SafeHtml;
  layout?: string;
}

export interface PluginHooks {
  onInit?(): void | Promise<void>;
  onPageLoad?(ctx: ULDEPluginContext): void | Promise<void>;
  onBeforeRender?(ctx: ULDEPluginContext): void | Promise<void>;
  onAfterRender?(ctx: ULDEPluginContext): void | Promise<void>;
  onDestroy?(): void | Promise<void>;
}



@Injectable({ providedIn: 'root' })
export class ULDEPluginRegistryService {
  private plugins: DocsPlugin[] = [];

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

  constructor(private overlay: ULDEOverlayService) {}

  /**
   * Register a plugin.
   */
  register(plugin: DocsPlugin) {
    if (!plugin.enabled && plugin.enabled !== undefined) return;

    this.plugins.push(plugin);
    this.plugins.sort((a, b) => a.name.localeCompare(b.name)); // deterministic order
  }

  /**
   * Run a specific hook across all plugins.
   */
  async run(
    hookName: keyof PluginHooks,
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
          message: `Plugin "${plugin.name}" failed in hook "${hookName}": ${String(err)}`,
          pluginName: plugin.name
        });
      }

      const end = performance.now();

      this.overlay.recordPluginTiming({
        pluginName: plugin.name,
        hookName,
        phase: ctx?.phase ?? 'unknown',
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
          message: `Plugin "${plugin.name}" failed in onDestroy: ${String(err)}`,
          pluginName: plugin.name
        });
      }

      const end = performance.now();

      this.overlay.recordPluginTiming({
        pluginName: plugin.name,
        hookName: 'onDestroy',
        phase: 'destroy',
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
