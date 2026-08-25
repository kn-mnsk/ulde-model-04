// src/ulde/engine/ulde-render-context-builder.engine.service.ts

import { Injectable } from '@angular/core';
import { ULDEPageContext, ULDERenderContext } from '@ulde/types/context';
import { buildUldeAst } from './ulde-ast-builder.engine';
import { renderUldeAstToHtml } from './ulde-ast-renderer.engine';
import { visitUldeAst } from './ulde-ast-visitor.engine';
import { ULDELayoutEngineService } from './ulde-layout.engine.service';

import { ULDEDiagnosticNode } from '@ulde/types/context';
import { ULDEOverlayService } from '@ulde/core/overlay';
import { ULDEDiagnostic } from '@ulde/types';


@Injectable({ providedIn: 'root' })
export class ULDERenderContextBuilderService {


  constructor(
    private layoutEngine: ULDELayoutEngineService,
    private overlay: ULDEOverlayService,
  ) { }

  async build(page: ULDEPageContext): Promise<ULDERenderContext> {

    // 1. Build AST
    const ast = buildUldeAst(page.token);

    // layout: sections
    const sectionAst = this.layoutEngine.buildSections(ast);

    // 🔥 Inject diagnostics into AST
    const diagnostics = this.overlay.diagnostics();
    const diagnosticNodes: ULDEDiagnosticNode[] = diagnostics.map((d: ULDEDiagnostic) => ({
      type: 'diagnostic',
      meta: {
        level: d.level,
        message: d.message,
        // code: d.code
        lifecyclePhase: d.lifecyclePhase,
        pluginName: d.pluginName
      }
    }));

    // Append diagnostics at the end of the AST
    const finalAst = [...sectionAst, ...diagnosticNodes];

    // 3. Render HTML
    const html = renderUldeAstToHtml(finalAst);

    // 4. Assemble render context
    const currentFrame = this.overlay.currentFrame();
    return {
      pageId: page.pageId,
      ast: sectionAst,
      html,
      layout: 'sections',
      frame: (currentFrame !== null) ? currentFrame : undefined,
    };
  }
}

