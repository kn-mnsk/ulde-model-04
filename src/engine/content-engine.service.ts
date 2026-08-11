// src/engine/content-engine.service.ts

import { inject, Injectable } from '@angular/core';

import { navigate } from '../app/global.utils/global.utils';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ContentEngineService {

  title = "ContentEngineService";

  async load(docId: string) {
    /* existing loader */

    console.log(`Log: ${this.title} load \nid=`, docId);

    const url = `assets/${docId}.md`;

    try {
      const response = await fetch(url);

      if (response.redirected) {
        const router = inject(Router);
        navigate(router, ['PageNotFound']);
        throw new Error(`Invalid URL: ${url}`);
      }

      const markdown = await response.text();
      await this.ulde.renderMarkdown(markdown);
    } catch (err) {
      console.error('${component} loadAndRender error:', err);
    }




  }
  transform(docId: string) {
    /* existing parser */


  }
}
