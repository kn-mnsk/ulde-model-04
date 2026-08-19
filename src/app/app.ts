import { Component, signal } from '@angular/core';
// import { DocsViewer } from './docs-viewer/docs-viewer';
import { UldeViewer } from '@ulde/viewer/ulde-viewer';

@Component({
  selector: 'app-root',
  imports: [UldeViewer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ulde-model-01');

  modelId = 'docs/ index';
  variantId = 'Angular api'
  zoom = 2;
  rotation =  { x: 1, y: 2, z: 3 };
}
