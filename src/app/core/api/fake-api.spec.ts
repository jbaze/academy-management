import { TestBed } from '@angular/core/testing';

import { FakeApi } from './fake-api';

describe('FakeApi', () => {
  let service: FakeApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FakeApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
