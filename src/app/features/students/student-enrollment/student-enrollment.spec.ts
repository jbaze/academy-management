import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentEnrollment } from './student-enrollment';

describe('StudentEnrollment', () => {
  let component: StudentEnrollment;
  let fixture: ComponentFixture<StudentEnrollment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentEnrollment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentEnrollment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
