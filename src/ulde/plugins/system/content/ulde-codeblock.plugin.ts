// src/ulde/plugins/system/content/ulde-codeblock.plugin.ts

import { ULDEPlugin } from "@ulde/types/plugin";

export const CodeBlockEnhancer: ULDEPlugin = {
  pluginKind: 'content',
  pluginName: "CodeblockEnhancer",
  description: "Markdown Code Block Enhancer: Enhances fenced code blocks with metadata",
  enabled: true,
  hooks: {
    async onPageLoad(ctx) {
      if (ctx.raw === undefined) return;

      ctx.raw = ctx.raw.replace(/```(\w+)/g, ((m: any, lang: any) => {
        return `\`\`\`${lang} data-lang="${lang}"`;
      }));
    },

    async onBeforeRender(ctx) {
      if (ctx.html === undefined) return;

      const html = ctx.html.replace(
        /<pre><code class="language-(\w+)">/g,
        ((m: any, lang: any) => `<pre data-lang="${lang}"><code class="language-${lang}">`
        ));

      ctx.html = html;
    }
  }
};
