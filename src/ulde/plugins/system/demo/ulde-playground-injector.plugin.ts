// src/ulde/plugins/system/demo/ulde-playground-injector.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";

import { createComponent, EnvironmentInjector } from "@angular/core";
import { Example02 } from "../../../../app/demo/example02/example02";

export const PlaygroundInjector: ULDEPlugin = {
  pluginKind: 'demo',
  pluginName: "PlaygroundInjector",
  description: "Hydrates <demo-playground> blocks into live Angular components",
  enabled: true,
  hooks: {
    async onAfterRender(ctx) {
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
};
