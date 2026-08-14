// src/engine/layout-engine.service.ts

import { Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class LayoutEngineService {

  prepare(pageId: string): any {
    /* choose layout, gather metadata */

    const layout: any = {};

    return layout;
  }

  render(astOrHtml: any): string | SafeHtml {
    /* apply layout */

    const html: String | SafeHtml = {};

    return html;

   }
}
