import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassroomForm } from './classroom-form';

describe('ClassroomForm', () => {
  let component: ClassroomForm;
  let fixture: ComponentFixture<ClassroomForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassroomForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassroomForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
