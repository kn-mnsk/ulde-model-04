// src/ulde/types/frame/ulde-frame.types.ts

import { ULDELifecyclePhaseTiming } from "../lifecycle/ulde-lifecycle.types";
import { ULDEPluginTiming } from "../timing/ulde-timing.types";

// ---------------------------------------------------------
// ULDE Frame
// ---------------------------------------------------------

export interface ULDEFrame {
  id: string;
  timestamp: number;
  phases: ULDELifecyclePhaseTiming[];
  pluginTimings: ULDEPluginTiming[];
}
