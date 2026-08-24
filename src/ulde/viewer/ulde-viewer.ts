// src/ulde/viewer/ulde-viewer.ts

import type { AfterViewInit, OnDestroy, } from '@angular/core';
import { Component, ElementRef, ViewChild, effect, input, output } from '@angular/core';
import { ULDELifecycleService, ULDEOverlayService } from '@ulde/core';
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

  modelId = input<string>();
  variantId = input<string>();
  zoom = input<number>(1);
  rotation = input<ULDERendererState['rotation']>({ x: 0, y: 0, z: 0 });

  ready = output<void>();
  error = output<Error>();
  stateChange = output<ULDERendererState>();

  constructor(
    private lifecycle: ULDELifecycleService,
    private overlay: ULDEOverlayService,
    private rendererService: ULDERendererService
  ) { }

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
    effect(() => {
      const phase = this.overlay.currentPhase();
      this.rendererService.setState({ currentPhase: phase?.lifecyclePhase });
    });

    // 🔥 React to diagnostics
    effect(() => {
      const diagnostics = this.overlay.diagnostics();
      this.rendererService.setState({ diagnostics });
    });

    // 🔥 React to frame finalization
    effect(() => {
      const frame = this.overlay.currentFrame();
      this.rendererService.setState({ frame });
    });

  }

  ngOnDestroy(): void {
    this.rendererService.dispose();
  }

  ngOnChanges(): void {
    this.syncInputs();
  }

  private syncInputs() {
    this.rendererService.setState({
      modelId: this.modelId(),
      variantId: this.variantId(),
      zoom: this.zoom(),
      rotation: this.rotation(),
      // eventually:
      // renderContext: this.renderContextFromULDE,
    });
  }
}
