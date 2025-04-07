import { TestBed } from '@angular/core/testing';

import { AlgeService } from './alge.service';

describe('AlgeService', () => {
  let service: AlgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
