// src/ulde/plugins/system/demo/ulde-demo.plugin.ts

import { ULDEPlugin } from '@ulde/types/plugin';
import { visitUldeAst } from '@ulde/engine';

export const DemoBlockPlugin: ULDEPlugin = {
  pluginKind: 'demo',
  pluginName: 'demo-block',
  description: 'Convert fenced code blocks with demo info into ULDE demo nodes.',
  enabled: true,
  hooks: {
    onBeforeRender(ctx) {
      visitUldeAst(ctx.ast, {
        pre(node) {
          if (node.type === 'code' && node.lang?.startsWith('demo')) {
            const parts = node.lang.split(/\s+/);
            const idPart = parts.find(p => p.startsWith('id='));
            const id = idPart ? idPart.split('=')[1] : 'demo';

            return {
              type: 'demo',
              meta: {
                id,
                code: node.value,
                lang: 'javascript'
              },
              children: []
            };
          } else{
            return undefined;
          }

        }
      });
    }
  }
};
