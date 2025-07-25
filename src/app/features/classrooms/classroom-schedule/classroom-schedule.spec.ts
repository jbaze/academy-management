import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassroomSchedule } from './classroom-schedule';

describe('ClassroomSchedule', () => {
  let component: ClassroomSchedule;
  let fixture: ComponentFixture<ClassroomSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassroomSchedule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassroomSchedule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
