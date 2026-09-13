import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UldePluginTimelinePanel } from './ulde-plugin-timeline-panel';

describe('UldePluginTimelinePanel', () => {
  let component: UldePluginTimelinePanel;
  let fixture: ComponentFixture<UldePluginTimelinePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UldePluginTimelinePanel],
    }).compileComponents();

    fixture = TestBed.createComponent(UldePluginTimelinePanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
