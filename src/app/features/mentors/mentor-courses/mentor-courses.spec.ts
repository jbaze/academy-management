import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorCourses } from './mentor-courses';

describe('MentorCourses', () => {
  let component: MentorCourses;
  let fixture: ComponentFixture<MentorCourses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorCourses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorCourses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
