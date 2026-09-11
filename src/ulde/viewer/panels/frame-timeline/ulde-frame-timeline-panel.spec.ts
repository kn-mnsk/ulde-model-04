import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UldeFrameTimelinePanel } from './ulde-frame-timeline-panel';

describe('UldeFrameTimelinePanel', () => {
  let component: UldeFrameTimelinePanel;
  let fixture: ComponentFixture<UldeFrameTimelinePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UldeFrameTimelinePanel],
    }).compileComponents();

    fixture = TestBed.createComponent(UldeFrameTimelinePanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
