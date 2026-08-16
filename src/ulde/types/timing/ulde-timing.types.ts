// src/ulde/types/timing/ulde-timing.types.ts

import { ULDEPluginKind, ULDEPluginHooks } from "../plugin/ulde-plugin.types";
import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";

// ---------------------------------------------------------
// ULDE Plugin Timing
// ---------------------------------------------------------

export interface ULDEPluginTiming {
  pluginName: string;
  pluginKind: ULDEPluginKind;
  hookName: keyof ULDEPluginHooks;
  lifecyclePhase: ULDELifecyclePhase;
  duration: number;
}
