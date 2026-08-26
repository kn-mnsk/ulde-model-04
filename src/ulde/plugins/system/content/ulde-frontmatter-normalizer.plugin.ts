// src/ulde/plugins/system/content/ulde-frontmatter-normalizer.plugin.ts

import { ULDEPlugin } from '@ulde/types/plugin';

export const FrontmatterNormalizer: ULDEPlugin = {
  pluginKind: 'content',
  pluginName: "FrontmatterNormalizer",
  description: "Normalizes frontmatter fields",
  enabled: true,
  hooks: {
    onPageLoad(ctx) {
      ctx.meta['title'] ??= "Untitled";
      ctx.meta['tags'] ??= [];
      ctx.meta['updated'] ??= new Date().toISOString();
    }
  }
};
