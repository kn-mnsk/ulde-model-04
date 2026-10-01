// src/ulde/core/ulde-lifecycle.service.ts

import { Injectable } from '@angular/core';
import { ULDEPluginRegistryService, ULDERuntimeService } from '@ulde/core';
import { ULDEDevtoolsService } from '@ulde/core/devtools';
import { ULDEArtifacts, ULDEExecutionContext, ULDEPageContext, ULDERenderContext, } from '@ulde/types/context';
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';

import { ULDERenderContextBuilderService } from '@ulde/engine';

@Injectable({ providedIn: 'root' })
export class ULDELifecycleService {

  constructor(
    private devtoolsService: ULDEDevtoolsService,
    private pluginRegistry: ULDEPluginRegistryService,
    private runtime: ULDERuntimeService,
    private renderContextBuilder: ULDERenderContextBuilderService,
  ) { }


  /**
   * Wrap lifecycle phase start/end with devtoolsService timing.
   */
  private async runPluginByLifecyclePhase(
    lifecyclePhase: ULDELifecyclePhase,
    executionCtx?: ULDEExecutionContext
  ) {
    this.devtoolsService.startPhase(lifecyclePhase);

    try {

      if (executionCtx) {
        await this.pluginRegistry.runPhase(executionCtx);
      }

      this.devtoolsService.endPhase(lifecyclePhase);
    } catch (err) {
      this.devtoolsService.addDiagnostic({
        level: 'error',
        message: `Error in phase "${lifecyclePhase}": ${String(err)}`,
        lifecyclePhase,
      });
      console.log(`Log: [ULDELifecycleServic - runPluginByLifecyclePhase]\nmessage=`, `Error in phase "${lifecyclePhase}": ${String(err)}`);
    }

  }

  /**
  * Full lifecycle execution for a page.
  */
  async executeLifecycle(pageContext: ULDEPageContext): Promise<ULDERenderContext | undefined> {

    // INIT
    const artifacts: ULDEArtifacts = {
      toc: [],
      anchors: [],
      sections: [],
      links: [],
      codeBlocks: [],
      diagnostics: [],
      pluginData: {}
    };

    const executionContext: ULDEExecutionContext = {
      lifecyclePhase: 'init',
      page: pageContext,
      artifacts: artifacts
    }

    await this.runPluginByLifecyclePhase('init');

    // LOAD (content + navigation plugins)
    executionContext.lifecyclePhase = 'load';
    await this.runPluginByLifecyclePhase('load', executionContext);

    // RENDER
    // 1. Build initial AST
    const initialAst = this.renderContextBuilder.buildInitialAst(executionContext);

    executionContext.render = {
      pageId: pageContext.pageId,
      ast: initialAst,
      html: '',
      layout: ''
    };

    // console.log(`Log: [ULDELifecycleService] initialAst : \n`, initialAst);

    // 2. Run render phase plugins on AST
    executionContext.lifecyclePhase = 'render';
    await this.runPluginByLifecyclePhase('render', executionContext);
    // console.log(`Log: [ULDELifecycleService] rendercontex after run render phase plugins on AST : \n`, executionContext.render);

    // 3. Build final context (sections + diagnostics + HTML)
    this.renderContextBuilder.buildFinalContext(executionContext);
    // console.log(`Log: [ULDELifecycleService] rendercontex after .buildFinalContext : \n`, executionContext.render);

    // HYDRATE (interactive plugins)
    executionContext.lifecyclePhase = 'hydrate';
    await this.runPluginByLifecyclePhase('hydrate', executionContext);

    // AFTER RENDER (ULDE system plugins)
    executionContext.lifecyclePhase = 'afterRender';
    await this.runPluginByLifecyclePhase('afterRender', executionContext);

    // Cleanup + diagnostics
    await this.pluginRegistry.destroyAll();
    this.runtime.finalizeFrameAndAnalyze();

    // console.log(`Log: [ULDELifecycleService] final rendercontext: \n`, executionContext.render);

    return executionContext.render;
    // return renderContext;
  }
}

