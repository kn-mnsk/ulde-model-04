import { Component, signal } from '@angular/core';
// import { DocsViewer } from './docs-viewer/docs-viewer';
import { ProductConfigurator } from '../ulde/configurator/ulde-configurator';
import { UldeDemo01 } from './demo/ulde-demo-01/ulde-demo-01';

@Component({
  selector: 'app-root',
  imports: [UldeDemo01],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('App');

}
