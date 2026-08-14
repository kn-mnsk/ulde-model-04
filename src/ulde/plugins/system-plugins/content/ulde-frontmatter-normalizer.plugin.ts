// src/plugins/system-plugins/content/ulde-frontmatter-normalizer.plugins.ts

import { ULDEPlugin } from "../../../types/ulde.types";

export const FrontmatterNormalizer: ULDEPlugin = {
  pluginPhase: 'content',
  pluginName: "FrontmatterNormalizer",
  description: "Normalizes frontmatter fields",
  hooks: {
    onPageLoad(ctx) {
      ctx.frontmatter['title'] ??= "Untitled";
      ctx.frontmatter['tags'] ??= [];
      ctx.frontmatter['updated'] ??= new Date().toISOString();
    }
  }
};
