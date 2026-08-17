
import { ULDERenderContext } from '@ulde/types/context';
import { ULDEPlugin } from '@ulde/types/plugin';

export function createDummyTestPlugin(): ULDEPlugin {
  return {
    pluginKind: 'content',
    name: 'DummyTestPlugin',
    version: '0.0.1',
    description: 'create dummy test plugin',

    hooks: {

      onBeforeRender(ctx: ULDERenderContext) {
        const { artifacts } = ctx;

        // Try typing: artifacts.
        // VS Code will show ALL artifact fields with ownership hints.
        artifacts.links;

        // Try hovering over: artifacts.links
        const links = artifacts.links;

        // Try hovering over: artifacts.timeline
        const timeline = artifacts.timeline;

        // Try hovering over: artifacts.profiler
        const profiler = artifacts.profiler;
      },
    }
  };
}
