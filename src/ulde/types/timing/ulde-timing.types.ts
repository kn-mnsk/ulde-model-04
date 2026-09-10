// src/ulde/types/timing/ulde-timing.types.ts

import { ULDEPluginKind, ULDEPluginExecutionHook } from "@ulde/types/plugin";
import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";

// ---------------------------------------------------------
// ULDE Plugin Timing
// timing of ONE plugin hook execution
// ---------------------------------------------------------

export interface ULDEPluginTiming {
  pluginName: string;
  pluginKind: ULDEPluginKind;
  hookName: ULDEPluginExecutionHook;
  lifecyclePhase: ULDELifecyclePhase;
  duration: number;
}
