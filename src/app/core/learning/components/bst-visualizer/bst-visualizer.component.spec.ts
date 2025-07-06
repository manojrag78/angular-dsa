import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BstVisualizerComponent } from './bst-visualizer.component';

describe('BstVisualizerComponent', () => {
  let component: BstVisualizerComponent;
  let fixture: ComponentFixture<BstVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BstVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BstVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
