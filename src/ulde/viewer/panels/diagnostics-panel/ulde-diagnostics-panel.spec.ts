import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UldeDiagnosticsPanel } from './ulde-diagnostics-panel';

describe('UldeDiagnosticsPanel', () => {
  let component: UldeDiagnosticsPanel;
  let fixture: ComponentFixture<UldeDiagnosticsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UldeDiagnosticsPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(UldeDiagnosticsPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
