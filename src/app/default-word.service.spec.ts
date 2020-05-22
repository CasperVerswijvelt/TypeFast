import { TestBed } from '@angular/core/testing';

import { DefaultWordService } from './default-word.service';

describe('DefaultWordService', () => {
  let service: DefaultWordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DefaultWordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
