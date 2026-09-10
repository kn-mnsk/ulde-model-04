// src/ulde/core/ulde-lifecycle.service.ts

import { Injectable } from '@angular/core';
import { ULDEPluginRegistryService, ULDERuntimeService } from '@ulde/core';
import { ULDEOverlayService } from '@ulde/core/overlay';
import { ULDEPageContext, ULDERenderContext, } from '@ulde/types/context';
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';

import { renderUldeAstToHtml, ULDERenderContextBuilderService } from '@ulde/engine';

@Injectable({ providedIn: 'root' })
export class ULDELifecycleService {

  constructor(
    private overlay: ULDEOverlayService,
    private pluginRegistry: ULDEPluginRegistryService,
    private runtime: ULDERuntimeService,
    private renderContextBuilder: ULDERenderContextBuilderService,
  ) { }


  /**
   * Wrap lifecycle phase start/end with overlay timing.
   */
  private async runPluginByLifecyclePhase(
    lifecyclePhase: ULDELifecyclePhase,
    ctx: Record<string, any> = {}
  ) {
    this.overlay.startPhase(lifecyclePhase);

    try {
      await this.pluginRegistry.runPhase(lifecyclePhase, {
        ...ctx,
        lifecyclePhase: lifecyclePhase,
      });

      this.overlay.endPhase(lifecyclePhase);
    } catch (err) {
      this.overlay.addDiagnostic({
        level: 'error',
        message: `Error in phase "${lifecyclePhase}": ${String(err)}`,
        lifecyclePhase,
      });
    }

  }

  /**
  * Full lifecycle execution for a page.
  */
  async executeLifecycle(pageContext: ULDEPageContext): Promise<ULDERenderContext> {

    // INIT
    await this.runPluginByLifecyclePhase('init');

    // LOAD (content + navigation plugins)
    await this.runPluginByLifecyclePhase('load', pageContext);

    // RENDER
    // 1. Build initial AST
    const initialAst = this.renderContextBuilder.buildInitialAst(pageContext);

    // 2. Run render phase plugins on AST
    await this.runPluginByLifecyclePhase('render', { ...pageContext, ast: initialAst });

    // 3. Build final context (sections + diagnostics + HTML)
    const renderContext = this.renderContextBuilder.buildFinalContext(pageContext, initialAst);

    // // RENDER (layout plugins)
    // const renderContext = await this.renderContextBuilder.build(pageContext);
    // await this.runPluginByLifecyclePhase('render', renderContext);

    // // HTML generation
    // if (!renderContext.ast) {
    //   this.overlay.addDiagnostic({ level: 'error', message: 'AST missing after render phase' });
    // }

    // renderContext.html = renderUldeAstToHtml(renderContext.ast);


    // HYDRATE (interactive plugins)
    await this.runPluginByLifecyclePhase('hydrate', renderContext);

    // AFTER RENDER (ULDE system plugins)
    await this.runPluginByLifecyclePhase('afterRender', renderContext);

    // Cleanup + diagnostics
    await this.pluginRegistry.destroyAll();
    this.runtime.finalizeFrameAndAnalyze();

    return renderContext;
  }
}


// startLifecyclePhase(lifecyclePhase: ULDELifecyclePhase) {
//   this.overlay.startPhase(lifecyclePhase);
// }

// endLifecyclePhase(lifecyclePhase: ULDELifecyclePhase) {
//   this.overlay.endPhase(lifecyclePhase);
// }


// async runPluginByLifecyclePhase(
//   lifecyclePhase: ULDELifecyclePhase,
//   hookName?: keyof ULDEPluginRegistryService['hookMap'],
//   ctx?: ULDEPageContext | ULDERenderContext | Record<string, any>,
// ) {
//   try {
//     this.startLifecyclePhase(lifecyclePhase);

//     if (hookName) {
//       await this.pluginRegistry.run(hookName, {
//         ...(ctx || {}),
//         lifecyclePhase,
//       });
//     }

//     this.endLifecyclePhase(lifecyclePhase);
//   } catch (err) {
//     this.overlay.addDiagnostic({
//       level: 'error',
//       message: `Error in phase "${lifecyclePhase}": ${String(err)}`,
//       lifecyclePhase,
//     });
//   }
// }

/**
 * Full lifecycle execution for a page.
 */
//   async executeLifecycle(pageContext: ULDEPageContext): Promise<ULDERenderContext> {

//     this.pluginRegistry.loadPlugins();

//     // INIT
//     await this.runPluginByLifecyclePhase('init', 'onInit');

//     // LOAD
//     await this.runPluginByLifecyclePhase('load', 'onPageLoad', pageContext);

//     // RENDER
//     const renderContext = await this.renderContextBuilder.build(pageContext);
//     await this.runPluginByLifecyclePhase('render', 'onBeforeRender', renderContext);

//     renderContext.html = renderUldeAstToHtml(renderContext.ast);

//     // HYDRATE
//     await this.runPluginByLifecyclePhase('hydrate', 'onAfterRender', renderContext);

//     // AFTER RENDER
//     // this.startLifecyclePhase('afterRender');

//     this.pluginRegistry.destroyAll();

//     this.runtime.finalizeFrameAndAnalyze();
//     // this.endLifecyclePhase('afterRender');

//     return renderContext;
//   }
// }
