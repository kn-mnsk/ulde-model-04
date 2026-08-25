import { Component } from '@angular/core';

import MarkdownIt from 'markdown-it';
import { ULDEPageContext, ULDERenderContext } from '@ulde/types/context';
import { ULDELifecycleService } from '@ulde/core';

import { UldeViewer } from '@ulde/viewer';

const demoMarkdown = `
# ULDE Demo

This is an **ULDE** end-to-end demo.

## TOC & Anchors

- This page has auto TOC
- Headings get anchors

## Demo Block

\`\`\`demo id=hello-ulde
console.log("Hello ULDE");
\`\`\`

## Diagnostics

This section will show ULDE diagnostics at the bottom.
`;


@Component({
  selector: 'app-ulde-demo-01',
  imports: [ UldeViewer],
  templateUrl: './ulde-demo-01.html',
  styleUrl: './ulde-demo-01.scss',
})
export class UldeDemo01 {

  private md = new MarkdownIt();

  private buildDemoPageContext(): ULDEPageContext {
    const tokens = this.md.parse(demoMarkdown, {});

    return {
      pageId: 'ulde-demo',
      raw: demoMarkdown,
      token: tokens,
      meta: {}
    };
  }


  private async runUldeDemo(lifecycle: ULDELifecycleService) {
    const pageContext = this.buildDemoPageContext();
    const renderContext = await lifecycle.executeLifecycle(pageContext);
    return renderContext;
  }


  renderContext?: ULDERenderContext;

  constructor(private lifecycle: ULDELifecycleService) { }

  async ngOnInit() {
    this.renderContext = await this.runUldeDemo(this.lifecycle);
  }


}


