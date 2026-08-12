// src/core/ulde/ulde-lifecycle.service.ts

import { Injectable } from '@angular/core';
export type PhaseName = "init" | "load" | "render" | "hydrate" | "afterRender";

@Injectable({ providedIn: 'root' })
export class ULDELifecycleService {
  private currentPhase: PhaseName | null = null;

  startPhase(name: PhaseName) {
    this.currentPhase = name;
    // record start time, etc.
  }

  endPhase(name: PhaseName) {
    // record end time, push to internal store
    this.currentPhase = null;
  }
}
