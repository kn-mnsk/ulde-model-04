import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UldeRuntimeInspectorPanel } from './ulde-runtime-inspector-panel';

describe('UldeRuntimeInspectorPanel', () => {
  let component: UldeRuntimeInspectorPanel;
  let fixture: ComponentFixture<UldeRuntimeInspectorPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UldeRuntimeInspectorPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(UldeRuntimeInspectorPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
