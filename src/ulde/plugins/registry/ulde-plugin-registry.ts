// src/ulde/plugins/registry/ulde-plugin-registry.ts

/**
 * ULDE older version
 * Those phases to be changed to ULDEPlugingKind
 *
 * This registry returns ONLY ULDE pipeline plugins:
 *   - CONTENT phase
 *   - TRANSFORM phase
 *   - DIAGNOSTICS phase
 *   - ASSEMBLE phase
 *
 * Browser DOM plugins (Mermaid, KaTeX auto-render, Anchors, ScrollSpy)
 * are NOT included here — they are registered in UldeBrowserHost.
 */


// ------------------------------
// content PLUGINS
// ------------------------------
import { CodeBlockEnhancer } from '@ulde/plugins/system/content';
import { FrontmatterNormalizer } from '@ulde/plugins/system/content';

// ------------------------------
// Layout PLUGINS
// ------------------------------
import { AutoTOC } from '@ulde/plugins/system/layout';

// ------------------------------
//Interactive PLUGINS
// ------------------------------
import { createDummyTestPlugin } from '@ulde/plugins/system/interactive';

// ------------------------------
// Navigation PLUGINS
// ------------------------------
import { Breadcrumbs } from '@ulde/plugins/system/navigation'

// ------------------------------
// ulde PLUGINS
// ------------------------------
import { OverlayCustomPanel } from '@ulde/plugins/system/ulde'
import { SlowPluginDetector } from '@ulde/plugins/system/ulde'
import { TimelineProfiler } from '@ulde/plugins/system/ulde'


// -----------------------------------------------------
// BUILD REGISTRY (ORDER MATTERS) - String World
// -----------------------------------------------------
export function createUldeStringPluginRegistry() {
  return [
    // Content PHASE
    CodeBlockEnhancer,
    FrontmatterNormalizer,

    // Layout PHASE
    AutoTOC,

    // Interactive PHASE
    createDummyTestPlugin(),

    // Navigation PHASE
    Breadcrumbs,

    //ulde Phase
    OverlayCustomPanel,
    SlowPluginDetector,
    TimelineProfiler
  ];

}
