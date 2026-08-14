// src/plugins/ulde-plugins/ulde-overlay-plugins.ts

import { DocsPlugin } from "../../core/ulde-plugin-registry.service";

export const OverlayCustomPanel: DocsPlugin = {
  name: "overlay.custom-panel",
  description: "Adds a custom panel to the ULDE overlay",
  hooks: {
    onInit() {
      const panel = document.createElement("div");
      panel.className = "ulde-custom-panel";
      panel.innerHTML = "<strong>Custom ULDE Panel</strong>";
      document.body.appendChild(panel);
    }
  }
};
