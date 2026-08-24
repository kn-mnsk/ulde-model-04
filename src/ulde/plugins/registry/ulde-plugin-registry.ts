// src/ulde/plugins/registry/ulde-plugin-registry.ts

// ------------------------------
// content PLUGINS
// ------------------------------
import { CodeBlockEnhancer } from '@ulde/plugins/system/content';
import { FrontmatterNormalizer } from '@ulde/plugins/system/content';

// ------------------------------
// Layout PLUGINS
// ------------------------------
import { AutoAnchors, AutoTOC } from '@ulde/plugins/system/layout';

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
import { DemoBlockPlugin } from '@ulde/plugins/system';


// -----------------------------------------------------
// BUILD REGISTRY (ORDER MATTERS) - String World
// -----------------------------------------------------
export function createUldeStringPluginRegistry() {
  return [
    // Content PHASE
    CodeBlockEnhancer,
    FrontmatterNormalizer,

    // Layout PHASE
    AutoAnchors,
    AutoTOC,
    DemoBlockPlugin,

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
