// src/ulde/plugins/system/demo/ulde-demo.plugin.ts

import { ULDEPluginInstance, ULDEPluginKind } from '@ulde/types/plugin';
import { visitUldeAst } from '@ulde/engine';
import { ULDEExecutionContext } from '@ulde/types';

export class ULDEDemoPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'demo';
  pluginName = 'demo-block';
  description = 'Convert fenced code blocks with demo info into ULDE demo nodes.';
  enabled = true;
  async run(ctx: ULDEExecutionContext) {

    if (ctx.lifecyclePhase !== 'load') return;
    if (!ctx.render) return;

    visitUldeAst(ctx.render.ast, {
      pre(node) {
        if (node.type === 'code' && node.lang?.startsWith('demo')) {
          const parts = node.lang.split(/\s+/);
          const idPart = parts.find(p => p.startsWith('id='));
          const id = idPart ? idPart.split('=')[1] : 'demo';

          return {
            type: 'demo',
            id: id,
            code: node.value,
            language: 'javascript',
            children: []
          };
        } else {
          return undefined;
        }

      }
    });
  }
}
