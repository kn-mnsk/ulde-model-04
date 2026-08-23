// src/ulde/types/diagnostic/ulde-diagnostic.types.ts

import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";

// ---------------------------------------------------------
// ULDE Diagnostics
// ---------------------------------------------------------

export interface ULDEDiagnostic {
  level: 'info' | 'warn' | 'error';
  message: string;
  lifecyclePhase?: ULDELifecyclePhase;
  pluginName?: string;
}
