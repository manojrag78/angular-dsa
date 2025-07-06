import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-backtracking-visualizer',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './backtracking-visualizer.component.html',
  styleUrl: './backtracking-visualizer.component.scss'
})
export class BacktrackingVisualizerComponent {

 @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  algorithms = [
    { name: 'N-Queens', value: 'nqueens' },
    { name: 'Sudoku Solver', value: 'sudoku' },
    { name: 'Maze Solver', value: 'maze' },
    { name: 'Subset Sum', value: 'subset' }
  ];

  selectedAlgorithm = this.algorithms[0].value;
  isVisualizing = false;
  visualizationSpeed = 50;
  boardSize = 8;
  currentStep = 0;
  solutionCount = 0;
  executionTime = 0;

  // Sudoku variables
 // In your component's initialization
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

  // Maze variables
  maze: number[][] = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];
  mazeStart = { x: 3, y: 1 };
  mazeEnd = { x: 4, y: 5 };

  // Subset Sum variables
  subsetNumbers = [3, 5, 7, 9, 11, 13];
  targetSum = 20;
  currentSubset: number[] = [];

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.drawInitialState();
  }

 drawInitialState() {
    const { width, height } = this.canvas.nativeElement;
    this.ctx.clearRect(0, 0, width, height);
    
    switch(this.selectedAlgorithm) {
      case 'nqueens':
        this.drawChessBoard();
        break;
      case 'sudoku':
        this.drawSudokuGrid();
        break;
      case 'maze':
        this.drawMazeGrid();
        break;
      case 'subset':
        this.drawSubsetInput();
        break;
    }
  }
  // =====================
  // SUDOKU IMPLEMENTATION
  // =====================
  async solveSudoku() {
    this.currentStep = 0;
    this.solutionCount = 0;
    const startTime = performance.now();
    
    // Make a copy of the board to work with
    const board = JSON.parse(JSON.stringify(this.sudokuBoard));
    
    await this.sudokuBacktrack(board);
    
    this.executionTime = performance.now() - startTime;
    this.isVisualizing = false;
  }

  async sudokuBacktrack(board: number[][]): Promise<boolean> {
  const emptyCell = this.findEmptyCell(board);
  if (!emptyCell) {
    this.solutionCount++;
    await this.highlightSudokuSolution(board);
    return true; // Return true to stop after first solution
  }

  const [row, col] = emptyCell;

  for (let num = 1; num <= 9; num++) {
    if (this.isSudokuValid(board, row, col, num)) {
      board[row][col] = num;
      this.currentStep++;
      await this.drawSudokuNumber(row, col, num, '#ff6b6b');
      await this.delay();

      if (await this.sudokuBacktrack(board)) {
        return true; // If solution found, propagate up
      }

      // Backtrack
      board[row][col] = 0;
      await this.drawSudokuNumber(row, col, 0, 'white');
    }
  }
  return false; // Trigger backtracking
}

  findEmptyCell(board: number[][]): [number, number] | null {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          return [row, col];
        }
      }
    }
    return null;
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

  async drawSudokuNumber(row: number, col: number, num: number, color: string) {
    const cellSize = 50;
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
  }
async highlightSudokuSolution(board: number[][]) {
  // Highlight all numbers in green for solution
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (this.sudokuBoard[row][col] === 0) { // Only highlight filled cells
        await this.drawSudokuNumber(row, col, board[row][col], '#51cf66');
        await this.delay(30); // Faster animation
      }
    }
  }
  
  // Show completion message
  this.ctx.font = '20px Arial';
  this.ctx.fillStyle = '#51cf66';
  this.ctx.textAlign = 'center';
  this.ctx.fillText('Puzzle Solved!', this.canvas.nativeElement.width/2, 20);
}

  // ===================
  // MAZE IMPLEMENTATION
  // ===================
  async solveMaze() {
    this.currentStep = 0;
    this.solutionCount = 0;
    const startTime = performance.now();
    
    // Make a copy of the maze to work with
    const maze = JSON.parse(JSON.stringify(this.maze));
    const path: {x: number, y: number}[] = [];
    
    await this.mazeBacktrack(maze, this.mazeStart.x, this.mazeStart.y, path);
    
    this.executionTime = performance.now() - startTime;
    this.isVisualizing = false;
  }

  async mazeBacktrack(maze: number[][], x: number, y: number, path: {x: number, y: number}[]): Promise<boolean> {
    // Check if we've reached the end
    if (x === this.mazeEnd.x && y === this.mazeEnd.y) {
      path.push({x, y});
      this.solutionCount++;
      await this.highlightMazeSolution(path);
      return true;
    }

    // Mark current cell as part of solution path
    maze[y][x] = 2; // 2 means visited
    path.push({x, y});
    this.currentStep++;
    await this.drawMazeCell(x, y, '#ff6b6b');
    await this.delay();

    // Possible moves (right, down, left, up)
    const directions = [
      {dx: 1, dy: 0},
      {dx: 0, dy: 1},
      {dx: -1, dy: 0},
      {dx: 0, dy: -1}
    ];

    for (const dir of directions) {
      const newX = x + dir.dx;
      const newY = y + dir.dy;

      if (this.isMazeMoveValid(maze, newX, newY)) {
        if (await this.mazeBacktrack(maze, newX, newY, path)) {
          return true;
        }
      }
    }

    // Backtrack
    path.pop();
    maze[y][x] = 0;
    await this.drawMazeCell(x, y, 'white');
    return false;
  }

  isMazeMoveValid(maze: number[][], x: number, y: number): boolean {
    return y >= 0 && y < maze.length && 
           x >= 0 && x < maze[0].length && 
           maze[y][x] === 0;
  }

  async drawMazeCell(x: number, y: number, color: string) {
    const cellSize = 40;
    const padding = 2;
    
    this.ctx.fillStyle = this.maze[y][x] === 1 ? '#333' : color;
    this.ctx.fillRect(
      x * cellSize + padding, 
      y * cellSize + padding, 
      cellSize - padding * 2, 
      cellSize - padding * 2
    );

    // Mark start and end
    if (x === this.mazeStart.x && y === this.mazeStart.y) {
      this.ctx.fillStyle = '#4dabf7';
      this.ctx.fillRect(
        x * cellSize + padding, 
        y * cellSize + padding, 
        cellSize - padding * 2, 
        cellSize - padding * 2
      );
    } else if (x === this.mazeEnd.x && y === this.mazeEnd.y) {
      this.ctx.fillStyle = '#51cf66';
      this.ctx.fillRect(
        x * cellSize + padding, 
        y * cellSize + padding, 
        cellSize - padding * 2, 
        cellSize - padding * 2
      );
    }
  }

  async highlightMazeSolution(path: {x: number, y: number}[]) {
    // Highlight path in green
    for (const cell of path) {
      await this.drawMazeCell(cell.x, cell.y, '#51cf66');
      await this.delay(100);
    }
    await this.delay(1000);
    
    // Reset maze
    this.drawMazeGrid();
  }

  async drawMazeGrid() {
    const cellSize = 40;
    const canvasWidth = this.maze[0].length * cellSize;
    const canvasHeight = this.maze.length * cellSize;
    
    this.canvas.nativeElement.width = canvasWidth;
    this.canvas.nativeElement.height = canvasHeight;
    
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[0].length; x++) {
        await this.drawMazeCell(x, y, this.maze[y][x] === 1 ? '#333' : 'white');
      }
    }
  }
  async visualizeAlgorithm() {
    this.isVisualizing = true;
    this.currentStep = 0;
    this.solutionCount = 0;
    const startTime = performance.now();

    switch(this.selectedAlgorithm) {
      case 'nqueens':
        await this.solveNQueens();
        break;
      case 'sudoku':
        await this.solveSudoku();
        break;
      case 'maze':
        await this.solveMaze();
        break;
      case 'subset':
        await this.solveSubsetSum();
        break;
    }

    this.executionTime = performance.now() - startTime;
    this.isVisualizing = false;
  }

  
  async solveNQueens() {
    const board: number[] = Array(this.boardSize).fill(-1);
    await this.nQueensBacktrack(board, 0);
  }

   async nQueensBacktrack(board: number[], row: number): Promise<boolean> {
    if (row === this.boardSize) {
      this.solutionCount++;
      await this.highlightSolution(board);
      return false; // Continue finding all solutions
    }

    for (let col = 0; col < this.boardSize; col++) {
      if (this.isQueenSafe(board, row, col)) {
        board[row] = col;
        this.currentStep++;
        await this.drawQueen(row, col, '#ff6b6b');
        await this.delay();

        if (await this.nQueensBacktrack(board, row + 1)) {
          return true;
        }

        await this.removeQueen(row, col);
        board[row] = -1;
      }
    }
    return false;
  }
  async removeQueen(row: number, col: number) {
    const cellSize = 40;
    const x = col * cellSize;
    const y = row * cellSize;

    // Redraw the cell
    this.ctx.fillStyle = (row + col) % 2 === 0 ? '#f0d9b5' : '#b58863';
    this.ctx.fillRect(x, y, cellSize, cellSize);
  }
  // ========================
  // SUBSET SUM IMPLEMENTATION
  // ========================
  async solveSubsetSum() {
    this.currentStep = 0;
    this.solutionCount = 0;
    this.currentSubset = [];
    const startTime = performance.now();
    
    await this.subsetSumBacktrack(this.subsetNumbers, this.targetSum, 0, []);
    
    this.executionTime = performance.now() - startTime;
    this.isVisualizing = false;
  }

  async subsetSumBacktrack(numbers: number[], target: number, index: number, current: number[]): Promise<boolean> {
    this.currentStep++;
    
    // Update current subset for visualization
    this.currentSubset = [...current];
    await this.drawSubsetState();
    await this.delay();

    const currentSum = current.reduce((sum, num) => sum + num, 0);
    
    if (currentSum === target) {
      this.solutionCount++;
      await this.highlightSubsetSolution(current);
      return true;
    }
    
    if (currentSum > target || index >= numbers.length) {
      return false;
    }
    
    // Include current number
    current.push(numbers[index]);
    if (await this.subsetSumBacktrack(numbers, target, index + 1, current)) {
      return true;
    }
    
    // Exclude current number
    current.pop();
    return await this.subsetSumBacktrack(numbers, target, index + 1, current);
  }

  async drawSubsetState() {
    const cellSize = 60;
    const padding = 10;
    const canvasWidth = this.subsetNumbers.length * cellSize + padding * 2;
    const canvasHeight = cellSize * 3;
    
    this.canvas.nativeElement.width = canvasWidth;
    this.canvas.nativeElement.height = canvasHeight;
    
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw all numbers
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    for (let i = 0; i < this.subsetNumbers.length; i++) {
      const x = i * cellSize + cellSize / 2 + padding;
      const y = cellSize / 2 + padding;
      
      // Background
      this.ctx.fillStyle = this.currentSubset.includes(this.subsetNumbers[i]) ? '#ff6b6b' : '#e9ecef';
      this.ctx.beginPath();
      this.ctx.arc(x, y, cellSize / 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#333';
      this.ctx.stroke();
      
      // Number
      this.ctx.fillStyle = '#333';
      this.ctx.fillText(this.subsetNumbers[i].toString(), x, y);
    }
    
    // Draw target sum
    this.ctx.fillStyle = '#333';
    this.ctx.font = '18px Arial';
    this.ctx.fillText(`Target: ${this.targetSum}`, canvasWidth / 2, cellSize + padding * 2);
    
    // Draw current sum
    const currentSum = this.currentSubset.reduce((sum, num) => sum + num, 0);
    this.ctx.fillText(`Current: ${currentSum}`, canvasWidth / 2, cellSize * 2 + padding * 2);
  }

  async highlightSubsetSolution(solution: number[]) {
    this.currentSubset = [...solution];
    await this.drawSubsetState();
    
    // Flash the solution
    for (let i = 0; i < 3; i++) {
      await this.delay(300);
      this.currentSubset = [];
      await this.drawSubsetState();
      await this.delay(300);
      this.currentSubset = [...solution];
      await this.drawSubsetState();
    }
  }

  drawSubsetInput() {
    this.currentSubset = [];
    this.drawSubsetState();
  }
   drawChessBoard() {
    const cellSize = 40;
    const boardSize = this.boardSize;
    const canvasSize = boardSize * cellSize;
    
    this.canvas.nativeElement.width = canvasSize;
    this.canvas.nativeElement.height = canvasSize;
    
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        this.ctx.fillStyle = (row + col) % 2 === 0 ? '#f0d9b5' : '#b58863';
        this.ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }
   drawSudokuGrid() {
    const cellSize = 50;
    const canvasSize = 9 * cellSize;
    
    this.canvas.nativeElement.width = canvasSize;
    this.canvas.nativeElement.height = canvasSize;
    
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;
    
    // Draw grid lines
    for (let i = 0; i <= 9; i++) {
      this.ctx.lineWidth = i % 3 === 0 ? 3 : 1;
      this.ctx.beginPath();
      this.ctx.moveTo(i * cellSize, 0);
      this.ctx.lineTo(i * cellSize, canvasSize);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * cellSize);
      this.ctx.lineTo(canvasSize, i * cellSize);
      this.ctx.stroke();
    }
  }
  delay(ms: number = this.visualizationSpeed) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
 async highlightSolution(board: number[]) {
    // Highlight all queens in green for solution
    for (let row = 0; row < board.length; row++) {
      await this.drawQueen(row, board[row], '#51cf66');
      await this.delay(200);
    }
    await this.delay(1000);
    
    // Reset to normal visualization
    for (let row = 0; row < board.length; row++) {
      await this.removeQueen(row, board[row]);
      await this.drawQueen(row, board[row], '#ff6b6b');
    }
  }
    async drawQueen(row: number, col: number, color: string) {
    const cellSize = 40;
    const x = col * cellSize + cellSize / 2;
    const y = row * cellSize + cellSize / 2;
    const radius = cellSize / 3;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.strokeStyle = 'black';
    this.ctx.stroke();
  }
   isQueenSafe(board: number[], row: number, col: number): boolean {
    for (let i = 0; i < row; i++) {
      // Check column and diagonals
      if (board[i] === col || 
          Math.abs(board[i] - col) === Math.abs(i - row)) {
        return false;
      }
    }
    return true;
  }
    resetVisualization() {
    this.isVisualizing = false;
    this.currentStep = 0;
    this.solutionCount = 0;
    this.executionTime = 0;
    this.drawInitialState();
  }
  
  onAlgorithmChange() {
    this.resetVisualization();
  }

  onBoardSizeChange() {
    this.resetVisualization();
  }
}
