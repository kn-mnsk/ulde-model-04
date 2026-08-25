import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Example01 } from './ulde-demo-01';

describe('Example01', () => {
  let component: Example01;
  let fixture: ComponentFixture<Example01>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Example01],
    }).compileComponents();

    fixture = TestBed.createComponent(Example01);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
