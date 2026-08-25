import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Example02 } from './example02';

describe('Example02', () => {
  let component: Example02;
  let fixture: ComponentFixture<Example02>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Example02],
    }).compileComponents();

    fixture = TestBed.createComponent(Example02);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
