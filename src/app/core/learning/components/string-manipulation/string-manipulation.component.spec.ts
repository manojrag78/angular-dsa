import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StringManipulationComponent } from './string-manipulation.component';

describe('StringManipulationComponent', () => {
  let component: StringManipulationComponent;
  let fixture: ComponentFixture<StringManipulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StringManipulationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StringManipulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
