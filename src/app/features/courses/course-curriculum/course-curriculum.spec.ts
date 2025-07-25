import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseCurriculum } from './course-curriculum';

describe('CourseCurriculum', () => {
  let component: CourseCurriculum;
  let fixture: ComponentFixture<CourseCurriculum>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseCurriculum]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseCurriculum);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
