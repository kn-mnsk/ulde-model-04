// src/ulde/plugins/system/interactive/ulde-dummy-test.plugin.ts


import { ULDERenderContext } from '@ulde/types/context';
import { ULDEPlugin } from '@ulde/types/plugin';

export function createDummyTestPlugin(): ULDEPlugin {
  return {
    pluginKind: 'content',
    name: 'DummyTestPlugin',
    version: '0.0.1',
    description: 'create dummy test plugin',
    enabled: true,
    hooks: {

      onBeforeRender(ctx: ULDERenderContext) {
        const { frame } = ctx;

        /**
         * To ne coded
         */


      },
    }
  };
}
