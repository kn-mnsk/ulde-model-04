// src/ulde/types/context/ulde-context.types.ts

import type Token from 'markdown-it/lib/token.mjs';
import { ULDEFrame } from "@ulde/types/frame";
// import { UldeArtifacts } from "@ulde/types/ulde-artifacts";
// ---------------------------------------------------------
// ULDE Context Objects
// ---------------------------------------------------------


export interface ULDEAstNode {
  type: string;
  children?: ULDEAstNode[];
  value?: string;
  depth?: number;
  lang?: string;
  meta?: Record<string, any>;
}

export interface ULDEPageContext {
  pageId: string;
  raw: string;
  token: Token[];
  meta: Record<string, any>;
}

export interface ULDERenderContext {
  pageId: string;
  ast: ULDEAstNode[];
  html: string;
  layout?: string;
  frame?: ULDEFrame; // optional, attached after lifecycle, as “observability attachment”
}

// Block Nodes
export interface ULDEHeadingNode extends ULDEAstNode {
  type: 'heading';
  depth: number;
}

export interface ULDEParagraphNode extends ULDEAstNode {
  type: 'paragraph';
}

export interface ULDEBlockquoteNode extends ULDEAstNode {
  type: 'blockquote';
}

export interface ULDEListNode extends ULDEAstNode {
  type: 'list';
  meta: {
    ordered: boolean;
  };
}

export interface ULDEListItemNode extends ULDEAstNode {
  type: 'listItem';
}

export interface ULDETableNode extends ULDEAstNode {
  type: 'table';
}

export interface ULDETableRowNode extends ULDEAstNode {
  type: 'tableRow';
}

export interface ULDETableCellNode extends ULDEAstNode {
  type: 'tableCell';
}

export interface ULDEThematicBreakNode extends ULDEAstNode {
  type: 'thematicBreak';
}

// Inline Nodes
export interface ULDETextNode extends ULDEAstNode {
  type: 'text';
  value: string;
}

export interface ULDEEmphasisNode extends ULDEAstNode {
  type: 'emphasis';
}

export interface ULDEStrongNode extends ULDEAstNode {
  type: 'strong';
}

export interface ULDEInlineCodeNode extends ULDEAstNode {
  type: 'inlineCode';
  value: string;
}

export interface ULDEBreakNode extends ULDEAstNode {
  type: 'break';
}

export interface ULDELinkNode extends ULDEAstNode {
  type: 'link';
  meta: {
    href: string;
    title?: string;
  };
}

export interface ULDEImageNode extends ULDEAstNode {
  type: 'image';
  meta: {
    src: string;
    alt?: string;
    title?: string;
  };
}

// Structural Nodes
export interface ULDERootNode extends ULDEAstNode {
  type: 'root';
}

export interface ULDESectionNode extends ULDEAstNode {
  type: 'section';
  meta: {
    id?: string;
    depth?: number;
  };
}

export interface ULDEFrontmatterNode extends ULDEAstNode {
  type: 'frontmatter';
  meta: Record<string, any>;
}

// Code & Media Nodes
export interface ULDECodeNode extends ULDEAstNode {
  type: 'code';
  lang?: string;
  value: string;
}

export interface ULDEFenceNode extends ULDEAstNode {
  type: 'fence';
  lang?: string;
  value: string;
}

export interface ULDEMathNode extends ULDEAstNode {
  type: 'math';
  value: string;
}

export interface ULDEInlineMathNode extends ULDEAstNode {
  type: 'inlineMath';
  value: string;
}

// ULDE Custom Nodes
export interface ULDEUldeBlockNode extends ULDEAstNode {
  type: 'uldeBlock';
  meta: {
    name: string;
    options?: Record<string, any>;
  };
}

export interface ULDEAdmonitionNode extends ULDEAstNode {
  type: 'admonition';
  meta: {
    kind: 'info' | 'warning' | 'danger' | 'success';
    title?: string;
  };
}

export interface ULDEDemoNode extends ULDEAstNode {
  type: 'demo';
  meta: {
    id: string;
    code: string;
    lang?: string;
  };
}

export interface ULDEComponentNode extends ULDEAstNode {
  type: 'component';
  meta: {
    name: string;
    props?: Record<string, any>;
  };
}

export interface ULDETocNode extends ULDEAstNode {
  type: 'toc';
}

export interface ULDEAnchorNode extends ULDEAstNode {
  type: 'anchor';
  meta: {
    id: string;
  };
}

// Meta Nodes
export interface ULDEPositionNode extends ULDEAstNode {
  type: 'position';
  meta: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface ULDEMetaNode extends ULDEAstNode {
  type: 'meta';
  meta: Record<string, any>;
}

export interface ULDEDiagnosticNode extends ULDEAstNode {
  type: 'diagnostic';
  meta: {
    level: 'warning' | 'error';
    message: string;
    code?: string;
  };
}

// Full ULDE AST Node Type Union
export type ULDEAstNodeUnion =
  | ULDEHeadingNode
  | ULDEParagraphNode
  | ULDEBlockquoteNode
  | ULDEListNode
  | ULDEListItemNode
  | ULDETableNode
  | ULDETableRowNode
  | ULDETableCellNode
  | ULDEThematicBreakNode
  | ULDETextNode
  | ULDEEmphasisNode
  | ULDEStrongNode
  | ULDEInlineCodeNode
  | ULDEBreakNode
  | ULDELinkNode
  | ULDEImageNode
  | ULDERootNode
  | ULDESectionNode
  | ULDEFrontmatterNode
  | ULDECodeNode
  | ULDEFenceNode
  | ULDEMathNode
  | ULDEInlineMathNode
  | ULDEUldeBlockNode
  | ULDEAdmonitionNode
  | ULDEDemoNode
  | ULDEComponentNode
  | ULDETocNode
  | ULDEAnchorNode
  | ULDEPositionNode
  | ULDEMetaNode
  | ULDEDiagnosticNode;

