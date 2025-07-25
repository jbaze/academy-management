import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorStudents } from './mentor-students';

describe('MentorStudents', () => {
  let component: MentorStudents;
  let fixture: ComponentFixture<MentorStudents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorStudents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorStudents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
