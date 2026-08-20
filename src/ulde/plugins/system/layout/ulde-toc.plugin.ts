// src/plugins/system-plugins/layout/ulde-toc.plugins.ts

import { ULDEPlugin } from "@ulde/types/plugin";

export const AutoTOC: ULDEPlugin = {
  pluginKind: 'layout',
  name: "AutoTOC",
  description: "Generates a table of contents from headings",
  enabled: true,
  hooks: {
    async onBeforeRender(ctx) {
      const headings = ctx.ast.children.filter((n: any) => /^h[1-6]$/.test(n.tag));
      const tocHtml = headings
        .map((h: any) => `<li><a href="#${h.id}">${h.text}</a></li>`)
        .join("");

      ctx.html = `<nav class="toc"><ul>${tocHtml}</ul></nav>` + ctx.html;
    }
  }
};

