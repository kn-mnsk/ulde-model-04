// src/plugins/system-plugins/layout/ulde-toc.plugins.ts

import { ULDEPlugin } from "../../../types/ulde.types";

export const AutoTOC: ULDEPlugin = {
  pluginPhase: 'layout',
  pluginName: "AutoTOC",
  description: "Generates a table of contents from headings",
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

