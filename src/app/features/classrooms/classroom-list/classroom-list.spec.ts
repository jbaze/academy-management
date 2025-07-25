import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassroomList } from './classroom-list';

describe('ClassroomList', () => {
  let component: ClassroomList;
  let fixture: ComponentFixture<ClassroomList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassroomList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassroomList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
