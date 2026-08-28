// src/ulde/plugins/system/ulde/ulde-overlay-custom-panel.plugin.ts

import { ULDEPlugin } from "@ulde/types//plugin";

export const OverlayCustomPanel: ULDEPlugin = {
  pluginKind: 'ulde',
  pluginName: "OverlayCustomPanel",
  description: "Adds a custom panel to the ULDE overlay",
  enabled: true,
  hooks: {
    // onInit() {
    //   const panel = document.createElement("div");
    //   panel.className = "ulde-custom-panel";
    //   panel.innerHTML = "<strong>Custom ULDE Panel</strong>";
    //   document.body.appendChild(panel);
    // },

    async onAfterRender(ctx) {

      const customPanel: string = `
      <div class="ulde-custom-panel">
      <strong>Custom ULDE Panel</strong>
      </div>
      `;

      ctx.html = customPanel;

    }

  }
};
