// src/ulde/engine/ulde-render-context-builder.service.ts

import { Injectable } from '@angular/core';
import { ULDEPageContext, ULDERenderContext } from '@ulde/types/context';
import { buildUldeAst } from './ulde-ast-builder.engine';
import { renderUldeAstToHtml } from './ulde-ast-renderer.engine';
import { visitUldeAst } from './ulde-ast-visitor.engine';

@Injectable({ providedIn: 'root' })
export class ULDERenderContextBuilderService {

  async build(page: ULDEPageContext): Promise<ULDERenderContext> {
    // 1. Build AST
    const ast = buildUldeAst(page.token);

    // 2. Run AST visitors (plugins may hook into this later)
    const astAfterPlugins = visitUldeAst(ast, {});

    // 3. Render HTML
    const html = renderUldeAstToHtml(astAfterPlugins);

    // 4. Assemble render context
    return {
      pageId: page.pageId,
      ast: astAfterPlugins,
      html,
      layout: undefined,
      frame: undefined,
    };
  }
}
