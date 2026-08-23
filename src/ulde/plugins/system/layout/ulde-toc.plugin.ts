// src/ulde/plugins/system/layout/ulde-toc.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";
import { ULDERenderContext } from "@ulde/types/context";

export const AutoTOC: ULDEPlugin = {
  pluginKind: 'layout',
  name: "AutoTOC",
  description: "Generates a table of contents from headings",
  enabled: true,
  hooks: {
    async onBeforeRender(ctx: ULDERenderContext) {
      const headings = ctx.ast.map(n =>
        n.children?.filter((n: any) => /^h[1-6]$/.test(n.tag))
      );
      const tocHtml = headings
        .map((h: any) => `<li><a href="#${h.id}">${h.text}</a></li>`)
        .join("");

      ctx.html = `<nav class="toc"><ul>${tocHtml}</ul></nav>` + ctx.html;
    }
  }
};

