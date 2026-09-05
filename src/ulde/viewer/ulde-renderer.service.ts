// src/ulde/viewer/ulde-renderer.service.ts
import { Injectable, ElementRef } from '@angular/core';
import {
  ULDERendererConfig, ULDERendererEvents, ULDERendererHandle, ULDERendererState
} from '@ulde/types/renderer';
import { ULDERenderContext, } from '@ulde/types/context';
import { ULDEDiagnostic } from '@ulde/types/diagnostic';
import { ULDEFrame } from '@ulde/types/frame';

@Injectable({ providedIn: 'root' })
export class ULDERendererService {
  private handle: ULDERendererHandle | null = null;

  init(
    host: ElementRef<HTMLElement>,
    size: { width: number; height: number },
    events?: ULDERendererEvents
  ): void {
    const config: ULDERendererConfig = {
      container: host.nativeElement,
      width: size.width,
      height: size.height,
      backgroundColor: '#ffffff'
    };

    this.handle = this.createUldeRenderer(config, events);
    events?.onReady?.();
  }

  setState(partial: Partial<ULDERendererState>): void {
    this.handle?.setState(partial);
  }

  getState(): ULDERendererState | null {
    return this.handle ? this.handle.getState() : null;
  }

  dispose(): void {
    this.handle?.dispose();
    this.handle = null;
  }

  private createUldeRenderer(
    config: ULDERendererConfig,
    events?: ULDERendererEvents
  ): ULDERendererHandle {
    let state: ULDERendererState = {
      modelId: '',
      variantId: undefined,
      zoom: 1,
      rotation: { x: 0, y: 0, z: 0 },
      renderContext: undefined,
      currentLifecyclePhase: undefined,
      diagnostics: [],
      frame: undefined
    };

    // initial placeholder
    config.container.innerHTML = '<p>ULDE Viewer READY</p>';

    function renderFromContext(renderContext: ULDERenderContext | undefined) {
      if (!renderContext) return;
      config.container.innerHTML = renderContext.html;
      bindInteractivity(config.container);
    }

    function renderLifecyclePhase(phase: string | undefined) {
      // optional: could add a data attribute or small badge
      if (!phase) {
        delete config.container.dataset['uldeLifecyclePhase'];
        return;
      }

      config.container.dataset['uldeLifecyclePhase'] = phase;
    }

    function renderDiagnosticsOverlay(diags: ULDEDiagnostic[] | undefined) {

      if (!diags || diags.length === 0) {
        delete config.container.dataset['uldeDiagnosticsCount'];
        return;
      }
      config.container.dataset['uldeDiagnosticsCount'] = String(diags.length);
    }


    function renderFrameInfo(frame: ULDEFrame | undefined) {
      // optional: could add timing info; keep minimal for now
      if (!frame) {
        delete config.container.dataset['uldeFrameId'];
        delete config.container.dataset['uldeFrameTimestamp'];
        return;
      }
      config.container.dataset['uldeFrameId'] = frame.id;
      config.container.dataset['uldeFrameTimestamp'] = String(frame.timestamp);
    }

    function bindInteractivity(container: HTMLElement) {
      // clear previous listeners by resetting innerHTML already done in renderFromContext

      // add event to highlight active section on scroll
      const sections = Array.from(container.querySelectorAll('section'));

      window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        for (const section of sections) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            section.classList.add('active');
          } else {
            section.classList.remove('active');
          }
        }
      });

      // add event to highlight TOC entry for active section
      const tocLinks = Array.from(container.querySelectorAll('.ulde-toc a'));

      window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        tocLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (!href) return;

          const target = container.querySelector(href);
          if (!target) return;

          const rect = target.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      });


      // TOC links: .ulde-toc a[href="#section-id"]
      container.querySelectorAll('.ulde-toc a').forEach(a => {
        a.addEventListener('click', ev => {
          ev.preventDefault();
          const href = (ev.currentTarget as HTMLAnchorElement).getAttribute('href');
          if (!href) return;
          const target = container.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      // Anchors: a[data-ulde-anchor="id"]
      container.querySelectorAll('a[data-ulde-anchor]').forEach(a => {
        a.addEventListener('click', ev => {
          ev.preventDefault();
          const id = (ev.currentTarget as HTMLElement).getAttribute('data-ulde-anchor');
          if (!id) return;
          const target = container.querySelector(`#${id}`);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      // Demo blocks: .ulde-demo[data-demo-code]
      container.querySelectorAll('.ulde-demo').forEach(demo => {
        demo.addEventListener('click', () => {
          const code = demo.getAttribute('data-demo-code');
          if (!code) return;
          try {
            const fn = new Function('console', code);
            fn(console);
            // console.log('[ULDE Demo] Running code:', code);
            // // eslint-disable-next-line no-eval
            // eval(code);
          } catch (err) {
            console.error('[ULDE Demo] Error running code:', err);
          }
        });
      });
    }

    return {
      setState(partial: Partial<ULDERendererState>) {
        state = { ...state, ...partial };

        if (partial.renderContext !== undefined) {
          renderFromContext(state.renderContext);
        }

        if (partial.currentLifecyclePhase !== undefined) {
          renderLifecyclePhase(state.currentLifecyclePhase);
        }

        if (partial.diagnostics !== undefined) {
          renderDiagnosticsOverlay(state.diagnostics);
        }

        if (partial.frame !== undefined) {
          renderFrameInfo(state.frame);
        }

        events?.onStateChange?.(state);
      },

      getState() {
        return state;
      },

      dispose() {
        config.container.innerHTML = '';
        delete config.container.dataset['uldeLifecyclePhase'];
        delete config.container.dataset['uldeDiagnosticsCount'];
        delete config.container.dataset['uldeFrameId'];
        delete config.container.dataset['uldeFrameTimestamp'];
      }
    };
  }
}
