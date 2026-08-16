// src/ulde/types/lifecycle/ulde-lifecycle.types.ts

//---------------------------------------------------------
// ULDE Lifecycle Phases
// ---------------------------------------------------------

export type ULDELifecyclePhase =
  | 'init'
  | 'load'
  | 'render'
  | 'hydrate'
  | 'afterRender';

export interface ULDELifecyclePhaseTiming {
  lifecyclePhase: ULDELifecyclePhase;
  startTime: number;
  endTime: number;
  duration: number;
}
