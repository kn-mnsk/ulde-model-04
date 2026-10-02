// src/ulde/plugins/system/demo/ulde-playground-injector.plugin.ts

import { ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

import { createComponent, EnvironmentInjector } from "@angular/core";
import { Example02 } from "../../../../app/demo/example02/example02"; // TBD
import { ULDEExecutionContext } from "@ulde/types";

export class ULDEPlaygroundInjectorPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'demo';
  pluginName = "ULDEPlaygroundInjectorPlugin";
  description = "Hydrates <demo-playground> blocks into live Angular components";
  enabled = true;
  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'hydrate') return;
    if (!ctx.render) return;

    const placeholders = document.querySelectorAll("demo-playground");
    // You must provide the Angular environment injector
    const injector = (window as any).ngEnvironment as EnvironmentInjector;

    for (const el of placeholders) {
      const cmpRef = createComponent(Example02, {
        hostElement: el,
        environmentInjector: injector
      });

      cmpRef.changeDetectorRef.detectChanges();
    }
  }
}

