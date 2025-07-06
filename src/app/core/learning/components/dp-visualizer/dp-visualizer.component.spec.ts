import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DpVisualizerComponent } from './dp-visualizer.component';

describe('DpVisualizerComponent', () => {
  let component: DpVisualizerComponent;
  let fixture: ComponentFixture<DpVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DpVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DpVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
