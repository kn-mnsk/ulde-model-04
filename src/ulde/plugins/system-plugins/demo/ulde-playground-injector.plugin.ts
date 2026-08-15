// src/plugins/system-plugins/demo/ulde-playground-Injector.plugins.ts

import { ULDEPlugin } from "../../../types/ulde.types";

export const PlaygroundInjector: ULDEPlugin = {
  pluginKind: 'demo',
  name: "PlaygroundInjector",
  description: "Hydrates <demo-playground> blocks into live Angular components",
  hooks: {
    async onAfterRender(ctx) {
      const placeholders = document.querySelectorAll("demo-playground");
      for (const el of placeholders) {
        // Example: mount Angular component
        window.angular.bootstrap(el, ["PlaygroundModule"]);
      }
    }
  }
};
