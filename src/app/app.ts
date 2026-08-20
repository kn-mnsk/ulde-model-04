import { Component, signal } from '@angular/core';
// import { DocsViewer } from './docs-viewer/docs-viewer';
import { ProductConfigurator } from '../ulde/configurator/ulde-configurator';

@Component({
  selector: 'app-root',
  imports: [ProductConfigurator],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('App');

}
