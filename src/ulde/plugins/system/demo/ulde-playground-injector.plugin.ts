// src/ulde/plugins/system/demo/ulde-playground-injector.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";

import { createComponent, EnvironmentInjector } from "@angular/core";
import { Example01 } from "../../../../app/demo/ulde-demo-01/ulde-demo-01";

export const PlaygroundInjector: ULDEPlugin = {
  pluginKind: 'demo',
  name: "PlaygroundInjector",
  description: "Hydrates <demo-playground> blocks into live Angular components",
  enabled: true,
  hooks: {
    async onAfterRender(ctx) {
      const placeholders = document.querySelectorAll("demo-playground");
      // You must provide the Angular environment injector
      const injector = (window as any).ngEnvironment as EnvironmentInjector;

      for (const el of placeholders) {
        const cmpRef = createComponent(Example01, {
          hostElement: el,
          environmentInjector: injector
        });

        cmpRef.changeDetectorRef.detectChanges();
      }
    }
  }
};
