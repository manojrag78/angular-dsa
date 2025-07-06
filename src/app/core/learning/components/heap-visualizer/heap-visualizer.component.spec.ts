import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeapVisualizerComponent } from './heap-visualizer.component';

describe('HeapVisualizerComponent', () => {
  let component: HeapVisualizerComponent;
  let fixture: ComponentFixture<HeapVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeapVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeapVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
