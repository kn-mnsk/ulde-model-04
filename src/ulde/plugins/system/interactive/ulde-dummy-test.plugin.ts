// src/ulde/plugins/system/interactive/ulde-dummy-test.plugin.ts

import { ULDEExecutionContext } from '@ulde/types/context';
import { ULDEPluginInstance, ULDEPluginKind } from '@ulde/types/plugin';

export class ULDEDummyTestPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'content';
  pluginName = 'ULDEDummyTestPlugin';
  version = '0.0.1';
  description = 'create dummy test plugin';
  enabled = true;
  async run(ctx: ULDEExecutionContext) {
    if (ctx.lifecyclePhase !== 'load') return;
    if (!ctx.artifacts) return;

    const { artifacts } = ctx;

    /**
     * To be coded
     */


  };

}





// legacy
// import { ULDERenderContext } from '@ulde/types/context';
// import { ULDEPlugin } from '@ulde/types/plugin';

// export const ULDEDummyTestPlugin: ULDEPlugin = {
//   pluginKind: 'content',
//   pluginName: 'DummyTestPlugin',
//   version: '0.0.1',
//   description: 'create dummy test plugin',
//   enabled: true,
//   hooks: {

//     onBeforeRender(ctx: ULDERenderContext) {
//       const { artifacts } = ctx;

//       /**
//        * To be coded
//        */


//     },
//   }
// };

