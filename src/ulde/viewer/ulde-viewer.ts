// src/ulde/viewer/ulde-viewer.ts

import { Component, ElementRef, ViewChild, input, output } from '@angular/core';
import type { AfterViewInit, OnDestroy, } from '@angular/core';
import { ULDERendererService } from '@ulde/viewer';
import type { ULDERendererState } from '@ulde/types/renderer';

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

  constructor(private rendererService: ULDERendererService) { }

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
      rotation: this.rotation()
    });
  }
}
