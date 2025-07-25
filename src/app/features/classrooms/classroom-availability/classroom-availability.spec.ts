import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassroomAvailability } from './classroom-availability';

describe('ClassroomAvailability', () => {
  let component: ClassroomAvailability;
  let fixture: ComponentFixture<ClassroomAvailability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassroomAvailability]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassroomAvailability);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
