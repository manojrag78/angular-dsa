import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortingAlgorithmsComponent } from './sorting-algorithms.component';

describe('SortingAlgorithmsComponent', () => {
  let component: SortingAlgorithmsComponent;
  let fixture: ComponentFixture<SortingAlgorithmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortingAlgorithmsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortingAlgorithmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
