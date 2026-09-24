// src/ulde/engine/ulde-render-context-builder.engine.service.ts

import { Injectable } from '@angular/core';
import { ULDEPageContext, ULDERenderContext } from '@ulde/types/context';
import { buildUldeAst } from './ulde-ast-builder.engine';
import { renderUldeAstToHtml } from './ulde-ast-renderer.engine';
import { ULDELayoutEngineService } from './ulde-layout.engine.service';

import { ULDEDevtoolsService } from '@ulde/core/devtools';
import { ULDEDiagnostic } from '@ulde/types';
import { ULDEDiagnosticNode } from '@ulde/types/context';


@Injectable({ providedIn: 'root' })
export class ULDERenderContextBuilderService {


  constructor(
    private layoutEngine: ULDELayoutEngineService,
    private devtoolsService: ULDEDevtoolsService,
  ) { }

  /**
    * Build the initial AST from page tokens.
    * This is called before the render phase plugins.
    */
  buildInitialAst(page: ULDEPageContext) {
    const ast = buildUldeAst(page.source.tokens);
    return ast;
  }


  /**
     * Build the final render context AFTER layout plugins have
     * mutated the AST (sections, anchors, TOC, etc.).
     *
     * This is called AFTER the 'render' lifecycle phase.
     */
  buildFinalContext(page: ULDEPageContext, ast: any[]): ULDERenderContext {
    // 1. Layout: sections (now that plugins have mutated AST)
    const sectionAst = this.layoutEngine.buildSections(ast);

    // 2. Inject diagnostics into AST
    const diagnostics = this.devtoolsService.$diagnostics();
    const diagnosticNodes: ULDEDiagnosticNode[] = diagnostics.map((d: ULDEDiagnostic) => ({
      type: 'diagnostic',
      level: d.level,
      message: d.message,
      code: "",
      pluginName: d.pluginName,
      pluginKind: d.pluginKind,
      lifecyclePhase: d.lifecyclePhase,
    }));

    const finalAst = [...sectionAst, ...diagnosticNodes];

    // 3. Render HTML from final AST
    const html = renderUldeAstToHtml(finalAst);

    // 4. Assemble render context
    const currentFrame = this.devtoolsService.$currentFrame();

    return {
      pageId: page.pageId,
      ast: finalAst,
      html,
      // layout: sectionAst, // for test
      layout: 'sections', // original
      artifacts: {
        toc: [],
        anchors: [],
        sections: [],
        links: [],
        codeBlocks:[],
        diagnostics:diagnostics,
        frame: currentFrame?? undefined,
        pluginData:{}
      }
      // frame: currentFrame ?? undefined,
    };
  }




  // async build(page: ULDEPageContext): Promise<ULDERenderContext> {

  //   // 1. Build AST
  //   const ast = buildUldeAst(page.token);

  //   // layout: sections
  //   const sectionAst = this.layoutEngine.buildSections(ast);

  //   // 🔥 Inject diagnostics into AST
  //   const diagnostics = this.devtoolsService.diagnostics();
  //   const diagnosticNodes: ULDEDiagnosticNode[] = diagnostics.map((d: ULDEDiagnostic) => ({
  //     type: 'diagnostic',
  //     meta: {
  //       level: d.level,
  //       message: d.message,
  //       // code: d.code
  //       lifecyclePhase: d.lifecyclePhase,
  //       pluginName: d.pluginName
  //     }
  //   }));

  //   // Append diagnostics at the end of the AST
  //   const finalAst = [...sectionAst, ...diagnosticNodes];
  //   console.log(`Log: [ULDERenderContextBuilderServic] finalAst=`, finalAst);


  //   // 3. Render HTML
  //   const html = renderUldeAstToHtml(finalAst);
  //   // console.log(`Log: [ULDERenderContextBuilderServic] 3. Render HTML FINISHED! \nhtml=`, html);

  //   // 4. Assemble render context
  //   const currentFrame = this.devtoolsService.currentFrame();
  //   return {
  //     pageId: page.pageId,
  //     ast: finalAst, //sectionAst,
  //     // html: '',
  //     html,
  //     layout: 'sections',
  //     frame: (currentFrame !== null) ? currentFrame : undefined,
  //   };
  // }


}

