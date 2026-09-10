// src/ulde/plugins/adaptors/ulde-plugin-hook-adaptor.ts

import { ULDEPluginInstance, ULDEPluginKind, ULDEPlugin } from "@ulde/types";

export class ULDEPluginHookAdapter implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind;
  pluginName: string;
  enabled?: boolean;

  constructor(private legacy: ULDEPlugin) {
    this.pluginKind = legacy.pluginKind;
    this.pluginName = legacy.pluginName;
    this.enabled = legacy.enabled;
  }

  async run(ctx: any) {
    const phase = ctx.lifecyclePhase;

    switch (phase) {
      case 'init':
        return this.legacy.hooks.onInit?.();
      case 'load':
        return this.legacy.hooks.onPageLoad?.(ctx);
      case 'render':
        return this.legacy.hooks.onBeforeRender?.(ctx);
      case 'hydrate':
        return this.legacy.hooks.onAfterRender?.(ctx);
      case 'afterRender':
        return this.legacy.hooks.onDestroy?.();
    }
  }

  async destroy() {
    return this.legacy.hooks.onDestroy?.();
  }
}
