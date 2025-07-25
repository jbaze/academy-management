import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorList } from './mentor-list';

describe('MentorList', () => {
  let component: MentorList;
  let fixture: ComponentFixture<MentorList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
