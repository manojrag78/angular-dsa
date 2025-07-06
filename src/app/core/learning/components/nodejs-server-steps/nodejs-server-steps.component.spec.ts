import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodejsServerStepsComponent } from './nodejs-server-steps.component';

describe('NodejsServerStepsComponent', () => {
  let component: NodejsServerStepsComponent;
  let fixture: ComponentFixture<NodejsServerStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodejsServerStepsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodejsServerStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
