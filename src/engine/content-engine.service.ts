// src/engine/content-engine.service.ts

import { inject, Injectable } from '@angular/core';

import { navigate } from '../app/global.utils/global.utils';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ContentEngineService {

  title = "ContentEngineService";

  async load(pageId: string): Promise<string | undefined> {
    /* existing loader */

    console.log(`Log: ${this.title} load \nid=`, pageId);

    const url = `assets/${pageId}.md`;

    try {
      const response = await fetch(url);

      if (response.redirected) {
        const router = inject(Router);
        navigate(router, ['PageNotFound']);
        throw new Error(`Invalid URL: ${url}`);
      }

      const raw = await response.text();

      return raw;

    } catch (err) {
      console.error('${component} loadAndRender error:', err);
      return undefined;
    }

  }
  transform(docId: string): Promise<any> {
    /* existing parser */


    return new Promise<any>(() => { });

  }
}
