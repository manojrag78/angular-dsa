import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sudoku-solver',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sudoku-solver.component.html',
  styleUrl: './sudoku-solver.component.scss'
})
export class SudokuSolverComponent {
 @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  // Visualization controls
  isVisualizing = false;
  isPaused = false;
  visualizationSpeed = 50;
  currentStep = 0;
  backtrackCount = 0;
  executionTime = 0;

  // Sudoku board (0 represents empty)
  sudokuBoard: number[][] = [
    [0, 4, 6, 8, 9, 1, 2, 0, 0],
    [7, 2, 0, 0, 3, 4, 8, 0, 0],
    [1, 0, 3, 4, 2, 5, 7, 0, 0],
    [0, 5, 9, 7, 1, 4, 2, 0, 0],
    [0, 2, 6, 0, 5, 7, 9, 0, 0],
    [0, 1, 3, 9, 4, 8, 5, 0, 0],
    [9, 0, 1, 5, 3, 7, 0, 4, 0],
    [2, 8, 7, 0, 0, 6, 3, 0, 0],
    [3, 4, 5, 2, 6, 1, 0, 0, 0]
  ];

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.drawSudokuGrid();
  }

  async solveSudoku() {
    if (this.isVisualizing) return;
    
    this.isVisualizing = true;
    this.isPaused = false;
    this.currentStep = 0;
    this.backtrackCount = 0;
    const startTime = performance.now();
    
    const board = JSON.parse(JSON.stringify(this.sudokuBoard));
    const emptyCells = this.findAllEmptyCells(board);
    
    await this.sudokuBacktrack(board, emptyCells, 0);
    
    this.executionTime = performance.now() - startTime;
    this.isVisualizing = false;
  }

  async sudokuBacktrack(board: number[][], emptyCells: [number, number][], index: number): Promise<boolean> {
    if (this.isPaused) {
      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (!this.isPaused) {
            clearInterval(interval);
            resolve(null);
          }
        }, 100);
      });
    }

    if (index >= emptyCells.length) {
      await this.highlightSudokuSolution(board);
      return true;
    }

    const [row, col] = emptyCells[index];

    for (let num = 1; num <= 9; num++) {
      if (this.isSudokuValid(board, row, col, num)) {
        board[row][col] = num;
        this.currentStep++;
        await this.drawSudokuNumber(row, col, num, '#ff6b6b');
        await this.delay();

        if (await this.sudokuBacktrack(board, emptyCells, index + 1)) {
          return true;
        }

        // Backtrack
        board[row][col] = 0;
        this.backtrackCount++;
        await this.drawSudokuNumber(row, col, 0, 'white');
      }
    }
    return false;
  }

  findAllEmptyCells(board: number[][]): [number, number][] {
    const emptyCells: [number, number][] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          emptyCells.push([row, col]);
        }
      }
    }
    return emptyCells;
  }

  isSudokuValid(board: number[][], row: number, col: number, num: number): boolean {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num && x !== col) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num && x !== row) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        const currentRow = boxRow + x;
        const currentCol = boxCol + y;
        if (board[currentRow][currentCol] === num && 
            (currentRow !== row || currentCol !== col)) {
          return false;
        }
      }
    }

    return true;
  }

  async highlightSudokuSolution(board: number[][]) {
    // Highlight all numbers in green for solution
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.sudokuBoard[row][col] === 0) {
          await this.drawSudokuNumber(row, col, board[row][col], '#51cf66');
          await this.delay(30);
        }
      }
    }
    
    // Show completion message
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#51cf66';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Puzzle Solved!', this.canvas.nativeElement.width/2, 20);
  }

  drawSudokuGrid() {
    const cellSize = 50;
    const canvasSize = cellSize * 9;
    
    this.canvas.nativeElement.width = canvasSize;
    this.canvas.nativeElement.height = canvasSize;
    
    // Draw background
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Draw grid lines
    this.ctx.strokeStyle = 'black';
    for (let i = 0; i <= 9; i++) {
      this.ctx.lineWidth = i % 3 === 0 ? 3 : 1;
      
      // Vertical lines
      this.ctx.beginPath();
      this.ctx.moveTo(i * cellSize, 0);
      this.ctx.lineTo(i * cellSize, canvasSize);
      this.ctx.stroke();
      
      // Horizontal lines
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * cellSize);
      this.ctx.lineTo(canvasSize, i * cellSize);
      this.ctx.stroke();
    }
    
    // Draw numbers
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const num = this.sudokuBoard[row][col];
        if (num !== 0) {
          this.ctx.fillStyle = '#333';
          this.ctx.fillText(num.toString(), col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
        }
      }
    }
  }

  async drawSudokuNumber(row: number, col: number, num: number, color: string) {
    const cellSize = this.canvas.nativeElement.width / 9;
    const x = col * cellSize;
    const y = row * cellSize;

    // Clear cell
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

    if (num !== 0) {
      this.ctx.font = '24px Arial';
      this.ctx.fillStyle = '#333';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(num.toString(), x + cellSize / 2, y + cellSize / 2);
    }

    // Draw grid lines again (since we cleared part of them)
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;
    if (col % 3 === 0) {
      this.ctx.lineWidth = 3;
    }
    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, this.canvas.nativeElement.height);
    this.ctx.stroke();
    
    if (row % 3 === 0) {
      this.ctx.lineWidth = 3;
    }
    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(this.canvas.nativeElement.width, y);
    this.ctx.stroke();
  }

  pauseSolving() {
    this.isPaused = !this.isPaused;
  }

  resetSudoku() {
    this.isVisualizing = false;
    this.isPaused = false;
    this.currentStep = 0;
    this.backtrackCount = 0;
    this.executionTime = 0;
    this.drawSudokuGrid();
  }

  delay(ms: number = this.visualizationSpeed) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
