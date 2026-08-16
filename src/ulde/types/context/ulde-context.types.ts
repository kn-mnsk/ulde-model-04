// src/ulde/types/context/ulde-context.types.ts

// ---------------------------------------------------------
// ULDE Context Objects
// ---------------------------------------------------------

export interface ULDEPageContext {
  pageId: string;
  route: string;
  frontmatter: Record<string, any>;
  rawContent: string;
}

export interface ULDERenderContext {
  pageId: string;
  ast: any;
  html: string;
  layout: string;
}
