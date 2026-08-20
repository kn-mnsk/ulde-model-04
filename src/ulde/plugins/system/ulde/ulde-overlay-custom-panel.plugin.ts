// src/plugins/system-plugins/ulde/ulde-overlay-custom-panel.plugins.ts

import { ULDEPlugin } from "@ulde/types//plugin";

export const OverlayCustomPanel: ULDEPlugin = {
  pluginKind: 'ulde',
  name: "OverlayCustomPanel",
  description: "Adds a custom panel to the ULDE overlay",
  enabled: true,
  hooks: {
    onInit() {
      const panel = document.createElement("div");
      panel.className = "ulde-custom-panel";
      panel.innerHTML = "<strong>Custom ULDE Panel</strong>";
      document.body.appendChild(panel);
    }
  }
};
