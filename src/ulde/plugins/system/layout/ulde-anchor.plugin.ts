// src/ulde/plugins/system/layout/ulde-anchor.plugin.ts
import { ULDEPlugin } from '@ulde/types/plugin';
import { visitUldeAst } from '@ulde/engine';

export const AutoAnchors: ULDEPlugin = {
  pluginKind: 'layout',
  pluginName: 'auto-anchors',
  description: 'Add <a id="slug"></a> before each heading.',
  enabled: true,
  hooks: {
    onBeforeRender(ctx) {
      visitUldeAst(ctx.ast, {
        pre(node) {
          if (node.type === 'heading') {
            const text = node.children
              ?.filter(c => c.type === 'text')
              .map(c => c.value)
              .join('') ?? '';

            const id = slugify(text);

            // Inject anchor node at the beginning of heading children
            node.children?.unshift({
              type: 'anchor',
              meta: { id }
            });
          }
        }
      });
    }
  }
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
