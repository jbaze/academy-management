import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorForm } from './mentor-form';

describe('MentorForm', () => {
  let component: MentorForm;
  let fixture: ComponentFixture<MentorForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
