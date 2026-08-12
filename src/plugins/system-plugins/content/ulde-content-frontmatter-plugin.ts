// src/plugins/system-plugins/content/ulde-content-frontmatter-plugins.ts

import { DocsPlugin } from "../../../core/ulde/ulde-plugin-registry.service";

export const FrontmatterNormalizer: DocsPlugin = {
  name: "content.frontmatter-normalizer",
  description: "Normalizes frontmatter fields",
  hooks: {
    onPageLoad(ctx) {
      ctx.frontmatter['title'] ??= "Untitled";
      ctx.frontmatter['tags'] ??= [];
      ctx.frontmatter['updated'] ??= new Date().toISOString();
    }
  }
};
