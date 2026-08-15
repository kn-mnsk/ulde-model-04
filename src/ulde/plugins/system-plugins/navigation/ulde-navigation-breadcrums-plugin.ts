// src/plugins/system-plugins/navigation/ulde-navigation-Breadcrumbs-plugins.ts

import { ULDEPlugin } from "../../../types/ulde.types";

export const Breadcrumbs: ULDEPlugin = {
  pluginKind: 'navigation',
  name: "Breadcrumbs",
  description: "Generates breadcrumb navigation from route",
  hooks: {
    onPageLoad(ctx) {
      const parts = ctx.route.split("/").filter(Boolean);
      ctx.frontmatter['breadcrumbs'] = parts.map((p, i) => ({
        label: p,
        href: "/" + parts.slice(0, i + 1).join("/")
      }));
    }
  }
};
