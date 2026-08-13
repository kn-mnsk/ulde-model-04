// src/plugins/system-plugins/content/ulde-content-codeblock-plugins.ts

import { DocsPlugin } from "../../../core/ulde/ulde-plugin-registry.service";

export const CodeBlockEnhancer: DocsPlugin = {
  name: "content.codeblock",
  description: "Enhances fenced code blocks with metadata",
  hooks: {
    async onPageLoad(ctx) {
      ctx.rawContent = ctx.rawContent.replace(/```(\w+)/g, ((m: any, lang: any) => {
        return `\`\`\`${lang} data-lang="${lang}"`;
      }));
    },

    async onBeforeRender(ctx) {
      ctx.html = ctx.html.replace(
        /<pre><code class="language-(\w+)">/g,
        ((m: any, lang: any) => `<pre data-lang="${lang}"><code class="language-${lang}">`
      ));
    }
  }
};
