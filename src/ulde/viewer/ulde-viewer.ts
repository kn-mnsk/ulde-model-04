// src/ulde/viewer/ulde-viewer.ts

import { AfterViewInit, OnDestroy, Component, ElementRef, ViewChild, effect, input, output, signal} from '@angular/core';
import { ULDEOverlayService } from '@ulde/core';
import type { ULDERendererState } from '@ulde/types/renderer';
import { ULDERendererService, UldeDiagnosticsPanel, UldeFrameTimelinePanel } from '@ulde/viewer';
import { isBrowser } from '../../app/global.utils/global.utils';
import { ULDEDiagnostic, ULDEFrame } from '@ulde/types';

@Component({
  selector: 'ulde-viewer',
  imports: [
    UldeDiagnosticsPanel, UldeFrameTimelinePanel
  ],
  templateUrl: 'ulde-viewer.html',
  styleUrl: 'ulde-viewer.scss',
})
export class UldeViewer implements AfterViewInit, OnDestroy {
  @ViewChild('viewerHost', { static: true })
  hostRef!: ElementRef<HTMLElement>;

  // Full renderer state comes in as a signal input
  $rendererState = input<ULDERendererState>();
  $frame = signal<ULDEFrame| null>(null);
  $diagnostics = signal<ULDEDiagnostic[]>([]);

  $ready = output<void>();
  $error = output<Error>();
  $stateChange = output<ULDERendererState>();

  constructor(
    public rendererService: ULDERendererService,
    private overlay: ULDEOverlayService,
  ) {
    // 🔥 React to ULDE lifecycle phases
    effect(() => {
      const phase = this.overlay.currentLifecyclePhaseTiming();
      if (!phase) return;

      this.rendererService.setState({
        currentLifecyclePhase: phase.lifecyclePhase,
      });
    });

    // 🔥 React to diagnostics
    effect(() => {
      const diagnostics = this.overlay.diagnostics();
      if (diagnostics.length < 1) return;

      console.log(`Log: [UldeViewer] effect() -> diagnostics=\n`, diagnostics);
      this.rendererService.setState({ diagnostics });
      this.$diagnostics.set(diagnostics);
    });

    // 🔥 React to frame finalization
    effect(() => {
      const frame = this.overlay.currentFrame();
      if (!frame) return;

      console.log(`Log: [UldeViewer] effect() -> frame=\n`, frame);
      this.rendererService.setState({ frame });
      this.$frame.set(frame);
    });

    // 🔥 React to rendererState signal input (without re-init)
    effect(() => {
      const s = this.$rendererState();
      if (!s) return;

      this.syncSignalInput();
    });
  }

  ngAfterViewInit(): void {
    if (!isBrowser()) return;

    this.rendererService.init(
      this.hostRef,
      {
        width: this.hostRef.nativeElement.clientWidth,
        height: this.hostRef.nativeElement.clientHeight,
      },
      {
        onReady: () => this.$ready.emit(),
        onError: (e) => this.$error.emit(e),
        onStateChange: (s) => this.$stateChange.emit(s),
      },
    );

    // Push initial state after init
    this.syncSignalInput();
  }

  ngOnDestroy(): void {
    this.rendererService.dispose();
  }

  private syncSignalInput(): void {
    const s = this.$rendererState();
    if (!s) return;

    this.rendererService.setState({
      modelId: s.modelId,
      variantId: s.variantId,
      zoom: s.zoom,
      rotation: s.rotation,
      renderContext: s.renderContext,
    });
  }

  /**
   * Theme Switcher
   * @param theme
   */
  setTheme(theme: 'light' | 'dark') {
    this.hostRef.nativeElement.setAttribute('data-theme', theme);
  }

  onHighLight(message: string) {
    this.rendererService.highlightDiagnostic(message)
  }

  getFrame(): ULDEFrame | null {
    const frame = this.rendererService.getState()?.frame;
    if (!frame) return null;
    return frame

  }
}
