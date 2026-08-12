// src/plugins/system-plugins/navigation/ulde-navigation-plugins.ts

import { DocsPlugin } from "../../../core/ulde/ulde-plugin-registry.service";

export const Breadcrumbs: DocsPlugin = {
  name: "nav.breadcrumbs",
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
