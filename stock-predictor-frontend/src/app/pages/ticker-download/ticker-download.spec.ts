import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TickerDownload } from './ticker-download';

describe('TickerDownload', () => {
  let component: TickerDownload;
  let fixture: ComponentFixture<TickerDownload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TickerDownload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TickerDownload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
