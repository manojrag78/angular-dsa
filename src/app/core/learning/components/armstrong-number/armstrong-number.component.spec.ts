import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArmstrongNumberComponent } from './armstrong-number.component';

describe('ArmstrongNumberComponent', () => {
  let component: ArmstrongNumberComponent;
  let fixture: ComponentFixture<ArmstrongNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArmstrongNumberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArmstrongNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
