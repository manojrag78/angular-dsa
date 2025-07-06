import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackQueueVisualizerComponent } from './stack-queue-visualizer.component';

describe('StackQueueVisualizerComponent', () => {
  let component: StackQueueVisualizerComponent;
  let fixture: ComponentFixture<StackQueueVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StackQueueVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StackQueueVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
