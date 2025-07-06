import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacktrackingVisualizerComponent } from './backtracking-visualizer.component';

describe('BacktrackingVisualizerComponent', () => {
  let component: BacktrackingVisualizerComponent;
  let fixture: ComponentFixture<BacktrackingVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BacktrackingVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BacktrackingVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
