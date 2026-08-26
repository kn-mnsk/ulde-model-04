// src/ulde/types/diagnostic/ulde-diagnostic.types.ts

import { ULDEPluginKind } from "@ulde/types/plugin";
import { ULDELifecyclePhase } from "../lifecycle/ulde-lifecycle.types";


// ULDE Diagnostics
export type ULDEDiagnosticLevel = 'info' | 'warn' | 'error';

export interface ULDEDiagnostic {
  level: ULDEDiagnosticLevel;
  message: string;
  lifecyclePhase?: ULDELifecyclePhase;
  pluginName?: string;
  pluginKind?: ULDEPluginKind;
}
