import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingClasses } from './upcoming-classes';

describe('UpcomingClasses', () => {
  let component: UpcomingClasses;
  let fixture: ComponentFixture<UpcomingClasses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingClasses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingClasses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
