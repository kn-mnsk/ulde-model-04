// src/ulde/engine/ulde-ast-renderer.engine.ts

import { ULDEAstNode } from '@ulde/types/context';

export function renderUldeAstToHtml(nodes: ULDEAstNode[]): string {
  const buf: string[] = [];

  const renderNode = (node: ULDEAstNode) => {
    switch (node.type) {

      // ---------------------------------------------------------
      // Block nodes
      // ---------------------------------------------------------
      case 'heading':
        buf.push(`<h${node.depth}>`);
        node.children?.forEach(renderNode);
        buf.push(`</h${node.depth}>`);
        break;

      case 'paragraph':
        buf.push('<p>');
        node.children?.forEach(renderNode);
        buf.push('</p>');
        break;

      case 'blockquote':
        buf.push('<blockquote>');
        node.children?.forEach(renderNode);
        buf.push('</blockquote>');
        break;

      case 'list': {
        const ordered = node.meta?.['ordered'] === true;
        buf.push(ordered ? '<ol>' : '<ul>');
        node.children?.forEach(renderNode);
        buf.push(ordered ? '</ol>' : '</ul>');
        break;
      }

      case 'listItem':
        buf.push('<li>');
        node.children?.forEach(renderNode);
        buf.push('</li>');
        break;

      case 'thematicBreak':
        buf.push('<hr />');
        break;

      // ---------------------------------------------------------
      // Inline nodes
      // ---------------------------------------------------------
      case 'text':
        buf.push(escapeHtml(node.value ?? ''));
        break;

      case 'strong':
        buf.push('<strong>');
        node.children?.forEach(renderNode);
        buf.push('</strong>');
        break;

      case 'emphasis':
        buf.push('<em>');
        node.children?.forEach(renderNode);
        buf.push('</em>');
        break;

      case 'inlineCode':
        buf.push('<code>');
        buf.push(escapeHtml(node.value ?? ''));
        buf.push('</code>');
        break;

      case 'break':
        buf.push('<br />');
        break;

      case 'link': {
        const href = escapeHtml(node.meta?.['href'] ?? '');
        const title = node.meta?.['title']
          ? ` title="${escapeHtml(node.meta?.['title'])}"`
          : '';
        buf.push(`<a href="${href}"${title}>`);
        node.children?.forEach(renderNode);
        buf.push('</a>');
        break;
      }

      case 'image': {
        const src = escapeHtml(node.meta?.['src'] ?? '');
        const alt = escapeHtml(node.meta?.['alt'] ?? '');
        const title = node.meta?.['title']
          ? ` title="${escapeHtml(node.meta?.['title'])}"`
          : '';
        buf.push(`<img src="${src}" alt="${alt}"${title} />`);
        break;
      }

      // ---------------------------------------------------------
      // Code & math
      // ---------------------------------------------------------
      case 'code': {
        const langClass = node.lang ? ` class="language-${escapeHtml(node.lang)}"` : '';
        buf.push(`<pre><code${langClass}>`);
        buf.push(escapeHtml(node.value ?? ''));
        buf.push('</code></pre>');
        break;
      }

      case 'math':
        buf.push(`<div class="ulde-math">`);
        buf.push(escapeHtml(node.value ?? ''));
        buf.push('</div>');
        break;

      case 'inlineMath':
        buf.push(`<span class="ulde-math-inline">`);
        buf.push(escapeHtml(node.value ?? ''));
        buf.push('</span>');
        break;

      // ---------------------------------------------------------
      // ULDE custom nodes (minimal handling)
      // ---------------------------------------------------------
      case 'admonition': {
        const kind = node.meta?.['kind'] ?? 'info';
        const title = node.meta?.['title'] ?? '';
        buf.push(`<div class="ulde-admonition ulde-admonition-${escapeHtml(kind)}">`);
        if (title) {
          buf.push(`<div class="ulde-admonition-title">${escapeHtml(title)}</div>`);
        }
        buf.push('<div class="ulde-admonition-body">');
        node.children?.forEach(renderNode);
        buf.push('</div></div>');
        break;
      }

      case 'uldeBlock': {
        const name = node.meta?.['name'] ?? 'block';
        buf.push(`<div class="ulde-block ulde-block-${escapeHtml(name)}">`);
        node.children?.forEach(renderNode);
        buf.push('</div>');
        break;
      }

      case 'demo': {
        const id = node.meta?.['id'] ?? '';
        buf.push(`<div class="ulde-demo" data-demo-id="${escapeHtml(id)}">`);
        node.children?.forEach(renderNode);
        buf.push('</div>');
        break;
      }

      case 'toc':
        buf.push('<div class="ulde-toc"></div>');
        break;

      case 'anchor': {
        const id = node.meta?.['id'] ?? '';
        buf.push(`<a id="${escapeHtml(id)}"></a>`);
        break;
      }

      // ---------------------------------------------------------
      // Fallback: render children only
      // ---------------------------------------------------------
      default:
        node.children?.forEach(renderNode);
        break;
    }
  };

  nodes.forEach(renderNode);
  return buf.join('');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

