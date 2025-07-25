import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingSettings } from './billing-settings';

describe('BillingSettings', () => {
  let component: BillingSettings;
  let fixture: ComponentFixture<BillingSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
