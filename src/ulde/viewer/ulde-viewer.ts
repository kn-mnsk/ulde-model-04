// src/ulde/viewer/ulde-viewer.ts

import type { AfterViewInit, OnDestroy, } from '@angular/core';
import { Component, ElementRef, ViewChild, effect, input, output } from '@angular/core';
import { ULDEOverlayService } from '@ulde/core';
import { ULDERenderContext } from '@ulde/types';
import type { ULDERendererState } from '@ulde/types/renderer';
import { ULDERendererService } from '@ulde/viewer';

@Component({
  selector: 'ulde-viewer',
  templateUrl: `ulde-viewer.html`,
  styleUrl: 'ulde-viewer.scss'
})
export class UldeViewer implements AfterViewInit, OnDestroy {
  @ViewChild('canvasHost', { static: true })
  hostRef!: ElementRef<HTMLElement>;

  $rendererState = input<ULDERendererState>();

  // modelId = input<string>();
  // variantId = input<string>();
  // zoom = input<number>();
  // rotation = input<ULDERendererState['rotation']>();
  // renderContext = input<ULDERenderContext>();

  ready = output<void>();
  error = output<Error>();
  stateChange = output<ULDERendererState>();

  constructor(
    private rendererService: ULDERendererService,
    private overlay: ULDEOverlayService,
  ) {

    // 🔥 React to ULDE lifecycle phases
    effect(() => {
      const phase = this.overlay.currentLifecyclePhase();
      if (phase === null) return;

      this.rendererService.setState({ currentLifecyclePhase: phase?.lifecyclePhase });
    });

    // 🔥 React to diagnostics
    effect(() => {
      const diagnostics = this.overlay.diagnostics();
      this.rendererService.setState({ diagnostics });
    });

    // 🔥 React to frame finalization
    effect(() => {
      const frame = this.overlay.currentFrame();
      if (frame === null) return;

      this.rendererService.setState({ frame });
    });


   }

  ngAfterViewInit(): void {

    this.rendererService.init(
      this.hostRef,
      {
        width: this.hostRef.nativeElement.clientWidth,
        height: this.hostRef.nativeElement.clientHeight
      },
      {
        onReady: () => this.ready.emit(),
        onError: (e) => this.error.emit(e),
        onStateChange: (s) => this.stateChange.emit(s)
      }
    );

    this.syncInputs();


    // 🔥 React to ULDE lifecycle phases
    // effect(() => {
    //   const phase = this.overlay.currentLifecyclePhase();
    //   this.rendererService.setState({ currentLifecyclePhase: phase?.lifecyclePhase });
    // });

    // // 🔥 React to diagnostics
    // effect(() => {
    //   const diagnostics = this.overlay.diagnostics();
    //   this.rendererService.setState({ diagnostics });
    // });

    // // 🔥 React to frame finalization
    // effect(() => {
    //   const frame = this.overlay.currentFrame();
    //   if (frame === null) return;
    //   this.rendererService.setState({ frame });
    // });

  }

  ngOnDestroy(): void {
    this.rendererService.dispose();
  }

  ngOnChanges(): void {
    this.syncInputs();
  }

  private syncInputs() {
    this.rendererService.setState({
    //   modelId: this.modelId(),
    //   variantId: this.variantId(),
    //   zoom: this.zoom(),
    //   rotation: this.rotation(),
    //   renderContext: this.renderContext(),
      modelId: this.$rendererState()?.modelId,
      variantId: this.$rendererState()?.variantId,
      zoom: this.$rendererState()?.zoom,
      rotation: this.$rendererState()?.rotation,
      renderContext: this.$rendererState()?.renderContext,
    });
  }
}
