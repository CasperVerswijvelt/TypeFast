import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncorrectWordComponent } from './incorrect-word.component';

describe('IncorrectWordComponent', () => {
  let component: IncorrectWordComponent;
  let fixture: ComponentFixture<IncorrectWordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IncorrectWordComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncorrectWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
