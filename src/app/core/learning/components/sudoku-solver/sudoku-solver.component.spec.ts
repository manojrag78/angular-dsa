import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SudokuSolverComponent } from './sudoku-solver.component';

describe('SudokuSolverComponent', () => {
  let component: SudokuSolverComponent;
  let fixture: ComponentFixture<SudokuSolverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SudokuSolverComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SudokuSolverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
