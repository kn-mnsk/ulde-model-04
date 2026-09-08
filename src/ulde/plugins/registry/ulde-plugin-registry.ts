// src/ulde/plugins/registry/ulde-plugin-registry.ts

import {
  ULDECodeblockPlugin,
} from '@ulde/plugins/system/content/ulde-codeblock.plugin';
import {
  ULDEFrontmatterNormalizerPlugin,
} from '@ulde/plugins/system/content/ulde-frontmatter-normalizer.plugin';
import { ULDELifecyclePhase } from '@ulde/types/lifecycle';

import {
  ULDEDemoPlugin,
} from '@ulde/plugins/system/demo/ulde-demo.plugin';
import {
  ULDEPlaygroundInjectorPlugin,
} from '@ulde/plugins/system/demo/ulde-playground-injector.plugin';

import {
  ULDEDummyTestPlugin,
} from '@ulde/plugins/system/interactive/ulde-dummy-test.plugin';

import {
  ULDEAnchorPlugin,
} from '@ulde/plugins/system/layout/ulde-anchor.plugin';
import {
  ULDETocPlugin,
} from '@ulde/plugins/system/layout/ulde-toc.plugin';

import {
  ULDENavigationBreadcrumbsPlugin,
} from '@ulde/plugins/system/navigation/ulde-navigation-breadcrumbs.plugin';

import {
  ULDEOverlayCustomPanelPlugin,
} from '@ulde/plugins/system/ulde/ulde-overlay-custom-panel.plugin';
import {
  ULDESlowPluginDetectorPlugin,
} from '@ulde/plugins/system/ulde/ulde-slow-plugin-detector.plugin';
import {
  ULDETimelineProfilerPlugin,
} from '@ulde/plugins/system/ulde/ulde-timeline-profiler.plugin';

export type ULDEPluginClass = new (...args: any[]) => any;

export type ULDEPluginRegistryMap = {
  [P in ULDELifecyclePhase]?: ULDEPluginClass[];
};

/**
 * Phase‑aware, deterministic ULDE plugin registry.
 * This is the single source of truth for plugin ordering.
 */
export const ULDE_PLUGIN_REGISTRY: ULDEPluginRegistryMap = {
  // Reserved for future init‑only plugins
  init: [],

  // Content + navigation: operate on page context / tokens / early AST
  load: [
    ULDEFrontmatterNormalizerPlugin,
    ULDECodeblockPlugin,
    ULDEDemoPlugin,
    ULDEDummyTestPlugin,
    ULDENavigationBreadcrumbsPlugin,
  ],

  // Layout: operate on AST structure (sections, anchors, TOC)
  render: [
    ULDEAnchorPlugin,
    ULDETocPlugin,
  ],

  // Interactive: operate on rendered HTML / DOM
  hydrate: [
    ULDEPlaygroundInjectorPlugin,
  ],

  // ULDE system: diagnostics, overlay, performance analysis
  afterRender: [
    ULDEOverlayCustomPanelPlugin,
    ULDESlowPluginDetectorPlugin,
    ULDETimelineProfilerPlugin,
  ],
};
