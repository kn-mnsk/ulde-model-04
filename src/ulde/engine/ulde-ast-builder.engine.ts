// src/ulde/engine/ast-builder-engine.ts

import Token from 'markdown-it/lib/token.mjs';

import { ULDEAstNode } from '@ulde/types/context';

export function buildUldeAst(tokens: Token[]): ULDEAstNode[] {
  const root: ULDEAstNode[] = [];
  const stack: ULDEAstNode[][] = [root];

  const push = (node: ULDEAstNode) => {
    stack[stack.length - 1].push(node);
  };

  const open = (node: ULDEAstNode) => {
    push(node);
    stack.push(node.children = []);
  };

  const close = () => {
    stack.pop();
  };

  for (const t of tokens) {
    switch (t.type) {

      // ---------------------------------------------------------
      // Headings
      // ---------------------------------------------------------
      case 'heading_open':
        open({
          type: 'heading',
          depth: Number(t.tag.substring(1)),
        });
        break;

      case 'heading_close':
        close();
        break;

      // ---------------------------------------------------------
      // Paragraphs
      // ---------------------------------------------------------
      case 'paragraph_open':
        open({ type: 'paragraph' });
        break;

      case 'paragraph_close':
        close();
        break;

      // ---------------------------------------------------------
      // Lists
      // ---------------------------------------------------------
      case 'bullet_list_open':
        open({ type: 'list', meta: { ordered: false } });
        break;

      case 'ordered_list_open':
        open({ type: 'list', meta: { ordered: true } });
        break;

      case 'bullet_list_close':
      case 'ordered_list_close':
        close();
        break;

      case 'list_item_open':
        open({ type: 'listItem' });
        break;

      case 'list_item_close':
        close();
        break;

      // ---------------------------------------------------------
      // Blockquote
      // ---------------------------------------------------------
      case 'blockquote_open':
        open({ type: 'blockquote' });
        break;

      case 'blockquote_close':
        close();
        break;

      // ---------------------------------------------------------
      // Code blocks
      // ---------------------------------------------------------
      case 'fence':
        push({
          type: 'code',
          lang: t.info || undefined,
          value: t.content,
        });
        break;

      // ---------------------------------------------------------
      // Inline tokens
      // ---------------------------------------------------------
      case 'inline':
        for (const child of t.children || []) {
          switch (child.type) {

            case 'text':
              push({ type: 'text', value: child.content });
              break;

            case 'strong_open':
              open({ type: 'strong' });
              break;

            case 'strong_close':
              close();
              break;

            case 'em_open':
              open({ type: 'emphasis' });
              break;

            case 'em_close':
              close();
              break;

            case 'link_open':
              open({
                type: 'link',
                meta: { href: child.attrGet('href') || '' },
              });
              break;

            case 'link_close':
              close();
              break;

            case 'code_inline':
              push({
                type: 'inlineCode',
                value: child.content,
              });
              break;
          }
        }
        break;

      // ---------------------------------------------------------
      // Ignore everything else for now
      // ---------------------------------------------------------
      default:
        break;
    }
  }

  return root;
}
