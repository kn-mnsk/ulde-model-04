// src/ulde/plugins/system/navigation/ulde-navigation-breadcrumbs.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";

export const Breadcrumbs: ULDEPlugin = {
  pluginKind: 'navigation',
  pluginName: "Breadcrumbs",
  description: "Generates breadcrumb navigation from route",
  enabled: true,
  hooks: {
    onPageLoad(ctx) {
      const parts = ctx.raw.split("/").filter(Boolean);
      ctx.meta['breadcrumbs'] = parts.map((p, i) => ({
        label: p,
        href: "/" + parts.slice(0, i + 1).join("/")
      }));
    }
  }
};
