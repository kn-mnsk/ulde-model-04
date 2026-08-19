// src/ulde/types/context/ulde-context.types.ts

import { ULDEFrame } from "@ulde/types/frame";
import { UldeArtifacts } from "@ulde/types/ulde-artifacts";
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
  dom: HTMLElement;
  artifacts: UldeArtifacts;
  frame: ULDEFrame;
}
