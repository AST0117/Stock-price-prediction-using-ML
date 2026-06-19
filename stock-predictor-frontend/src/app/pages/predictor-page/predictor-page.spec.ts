import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictorPage } from './predictor-page';

describe('PredictorPage', () => {
  let component: PredictorPage;
  let fixture: ComponentFixture<PredictorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredictorPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PredictorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
