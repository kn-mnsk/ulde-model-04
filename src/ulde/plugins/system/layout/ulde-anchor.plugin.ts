// src/ulde/plugins/system/layout/ulde-anchor.plugin.ts

import { visitUldeAst } from '@ulde/engine';
import { ULDEAnchorNode, ULDEExecutionContext } from '@ulde/types';
import { ULDEPluginInstance, ULDEPluginKind } from '@ulde/types/plugin';

export class ULDEAnchorPlugin implements ULDEPluginInstance {
  // export const ULDEAnchorPlugin: ULDEPlugin = {
  pluginKind: ULDEPluginKind = 'layout';
  pluginName = 'ULDEAnchorPlugin';
  description = 'Add <a id="slug"></a> before each heading.';
  enabled = true;

  async run(ctx: ULDEExecutionContext & { lifecyclePhase: string }) {
    // onBeforeRender(ctx) {
    if (ctx.lifecyclePhase !== 'render') return;
    if (!ctx.render) return;

    console.log(`Log: [ULDEAnchorPlugin] run`);
    const headings: { depth: number, id: string; text: string }[] = [];
    visitUldeAst(ctx.render.ast, {
      pre(node) {
        if (node.type === 'heading') {
          const text = node.children
            ?.filter(c => c.type === 'text')
            .map(c => c.value)
            .join('') ?? '';
          const id = slugify(text);
          headings.push({ depth: node.depth!, id, text });


          // Inject anchor node at the beginning of heading children
          // node.children?.unshift({
          //   type: 'anchor',
          //   id: id
          // });
        }
      }
    });

    // Build Anchor AST node
    const anchorNode: ULDEAnchorNode = {
      type: 'anchor',
      id: slugify(text)

    }


    // Inject anchor node at the beginning of heading children
    node.children?.unshift({
      type: 'anchor',
      id: id
    });
  }
}


function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
