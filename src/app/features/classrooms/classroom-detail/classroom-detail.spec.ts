import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassroomDetail } from './classroom-detail';

describe('ClassroomDetail', () => {
  let component: ClassroomDetail;
  let fixture: ComponentFixture<ClassroomDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassroomDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassroomDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
