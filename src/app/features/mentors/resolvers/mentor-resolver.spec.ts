import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { mentorResolver } from './mentor-resolver';

describe('mentorResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => mentorResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
