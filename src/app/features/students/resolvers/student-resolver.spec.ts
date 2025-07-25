import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { studentResolver } from './student-resolver';

describe('studentResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => studentResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
