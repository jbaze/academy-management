import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorDetail } from './mentor-detail';

describe('MentorDetail', () => {
  let component: MentorDetail;
  let fixture: ComponentFixture<MentorDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
