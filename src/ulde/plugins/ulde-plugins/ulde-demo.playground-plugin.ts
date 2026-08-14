// src/plugins/ulde-plugins/ulde-demo-playground-plugins.ts


import { DocsPlugin } from "../../core/ulde-plugin-registry.service";

export const PlaygroundInjector: DocsPlugin = {
  name: "demo.playground",
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
