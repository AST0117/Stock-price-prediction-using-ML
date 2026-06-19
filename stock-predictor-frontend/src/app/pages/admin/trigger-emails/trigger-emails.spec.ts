import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriggerEmails } from './trigger-emails';

describe('TriggerEmails', () => {
  let component: TriggerEmails;
  let fixture: ComponentFixture<TriggerEmails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriggerEmails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TriggerEmails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
