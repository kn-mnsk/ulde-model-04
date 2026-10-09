// src/ulde/plugins/system/content/ulde-codeblock.plugin.ts

import { ULDEExecutionContext } from "@ulde/types";
import {ULDEPluginInstance, ULDEPluginKind } from "@ulde/types/plugin";

export class ULDECodeblockPlugin implements ULDEPluginInstance {
  pluginKind: ULDEPluginKind = 'content';
  pluginName = "CodeblockEnhancer";
  description = "Markdown Code Block Enhancer: Enhances fenced code blocks with metadata";
  enabled = true;

  async run(ctx: ULDEExecutionContext) {
    if (ctx.lifecyclePhase !== 'load') return;
    if (ctx.page.source.raw === undefined) return;


    console.log('Log: [ULDECodeblockPlugin] run');

    ctx.page.source.raw = ctx.page.source.raw.replace(/```(\w+)/g, ((m: any, lang: any) => {
      return `\`\`\`${lang} data-lang="${lang}"`;
    }));

    console.log('Log: [ULDECodeblockPlugin] finished');
  }


  // Is this going to be placed in 'renderContextBuilder.buildFinalContext'??

  // async onBeforeRender(ctx) {
  //   if (ctx.html === undefined) return;

  //   const html = ctx.html.replace(
  //     /<pre><code class="language-(\w+)">/g,
  //     ((m: any, lang: any) => `<pre data-lang="${lang}"><code class="language-${lang}">`
  //     ));

  //   ctx.html = html;
  // }




}

// legacy
// import { ULDEPlugin } from "@ulde/types/plugin";

// export const ULDECodeblockPlugin: ULDEPlugin = {
//   pluginKind: 'content',
//   pluginName: "CodeblockEnhancer",
//   description: "Markdown Code Block Enhancer: Enhances fenced code blocks with metadata",
//   enabled: true,
//   hooks: {
//     async onPageLoad(ctx) {
//       if (ctx.source.raw === undefined) return;

//       ctx.source.raw = ctx.source.raw.replace(/```(\w+)/g, ((m: any, lang: any) => {
//         return `\`\`\`${lang} data-lang="${lang}"`;
//       }));
//     },

//     async onBeforeRender(ctx) {
//       if (ctx.html === undefined) return;

//       const html = ctx.html.replace(
//         /<pre><code class="language-(\w+)">/g,
//         ((m: any, lang: any) => `<pre data-lang="${lang}"><code class="language-${lang}">`
//         ));

//       ctx.html = html;
//     }
//   }
// };
