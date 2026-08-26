// src/ulde/plugins/system/layout/ulde-toc.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";
import { ULDERenderContext } from "@ulde/types/context";
import { visitUldeAst } from "@ulde/engine";

export const AutoTOC: ULDEPlugin = {
  pluginKind: 'layout',
  pluginName: "auto-toc",
  description: "Generates a table of contents from headings",
  enabled: true,
  hooks: {
    async onBeforeRender(ctx: ULDERenderContext) {

      // const headings = ctx.ast.map(n =>
      //   n.children?.filter((n: any) => /^h[1-6]$/.test(n.tag))
      // );
      // const tocHtml = headings
      //   .map((h: any) => `<li><a href="#${h.id}">${h.text}</a></li>`)
      //   .join("");

      // ctx.html = `<nav class="toc"><ul>${tocHtml}</ul></nav>` + ctx.html;

      const headings: { depth: number; text: string }[] = [];

      // Collect headings
      visitUldeAst(ctx.ast, {
        pre(node) {
          if (node.type === 'heading') {
            const text = node.children
              ?.filter(c => c.type === 'text')
              .map(c => c.value)
              .join('') ?? '';
            headings.push({ depth: node.depth!, text });
          }
        }
      });

      // Build TOC AST node
      const tocNode = {
        type: 'toc',
        children: headings.map(h => ({
          type: 'link',
          meta: { href: `#${slugify(h.text)}` },
          children: [{ type: 'text', value: h.text }]
        }))
      };

      // Inject TOC at top
      ctx.ast.unshift(tocNode);
    }
  }
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
