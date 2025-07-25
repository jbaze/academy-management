import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorSchedule } from './mentor-schedule';

describe('MentorSchedule', () => {
  let component: MentorSchedule;
  let fixture: ComponentFixture<MentorSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorSchedule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorSchedule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
