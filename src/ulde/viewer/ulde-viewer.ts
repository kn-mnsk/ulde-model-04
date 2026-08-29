// src/ulde/viewer/ulde-viewer.ts

import type { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, ElementRef, ViewChild, effect, input, output } from '@angular/core';
import { ULDEOverlayService } from '@ulde/core';
import type { ULDERendererState } from '@ulde/types/renderer';
import { ULDERendererService } from '@ulde/viewer';
import { isBrowser } from '../../app/global.utils/global.utils';

@Component({
  selector: 'ulde-viewer',
  templateUrl: `ulde-viewer.html`,
  styleUrl: 'ulde-viewer.scss',
})
export class UldeViewer implements AfterViewInit, OnDestroy {
  @ViewChild('viewerHost', { static: true })
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
    // react signal input
    effect(() => {

      // if (!isBrowser()) return;

      this.rendererService.init(
        this.hostRef,
        {
          width: this.hostRef.nativeElement.clientWidth,
          height: this.hostRef.nativeElement.clientHeight,
        },
        {
          onReady: () => this.ready.emit(),
          onError: (e) => this.error.emit(e),
          onStateChange: (s) => this.stateChange.emit(s),
        },
      );

      // if (this.$rendererState()?.renderContext === undefined) return;



      console.log(`Log: [UldeViewer] Effect - React to Signal Input `, this.$rendererState());

      this.rendererService.setState({
        modelId: this.$rendererState()?.modelId,
        variantId: this.$rendererState()?.variantId,
        zoom: this.$rendererState()?.zoom,
        rotation: this.$rendererState()?.rotation,
        renderContext: this.$rendererState()?.renderContext,
        currentLifecyclePhase: undefined,
        diagnostics: [],
        frame: undefined
      });

      // console.log(
      //   `Log: [UldeViewer] Effect - React to Signal Input: \n After this.rendererService.setState  getState=`,
      //   this.rendererService.getState(),
      // );

    });

    // 🔥 React to ULDE lifecycle phases
    effect(() => {
      const phase = this.overlay.currentLifecyclePhaseTiming();
      if (phase === null) return;

      console.log(`Log: [UldeViewer] Effect -React to ULDE lifecycle phases `, phase);

      this.rendererService.setState({ currentLifecyclePhase: phase?.lifecyclePhase });
    });

    // 🔥 React to diagnostics
    effect(() => {
      const diagnostics = this.overlay.diagnostics();
      if (diagnostics.length === 0) return;

      console.log(`Log: [UldeViewer] Effect -React to diagnostics `, diagnostics);

      this.rendererService.setState({ diagnostics });
    });

    // 🔥 React to frame finalization
    effect(() => {
      const frame = this.overlay.currentFrame();
      if (frame === null) return;

      console.log(`Log: [UldeViewer] Effect -React to frame finalization `, frame);

      this.rendererService.setState({ frame });
    });
  }

  ngAfterViewInit(): void {
    if (!isBrowser()) return;

    requestAnimationFrame(() => {

      requestAnimationFrame(() => {
        const html = this.rendererService.getState()?.renderContext?.html;

        // console.log(`Log: [UldeViewer] ngAfterViewewInit state=`, state)

        if (html) {
          this.hostRef.nativeElement.innerHTML = html;
        }
        else {
          this.hostRef.nativeElement.innerHTML = `<div style="color: red;"> Error: Contents Not Correctly Rendered!!`;
        }

      })

    })


    // this.rendererService.init(
    //   this.hostRef,
    //   {
    //     width: this.hostRef.nativeElement.clientWidth,
    //     height: this.hostRef.nativeElement.clientHeight
    //   },
    //   {
    //     onReady: () => this.ready.emit(),
    //     onError: (e) => this.error.emit(e),
    //     onStateChange: (s) => this.stateChange.emit(s)
    //   }
    // );
    // this.syncSignalInput();
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
    // this.syncSignalInput();
  }

  private syncSignalInput() {
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
