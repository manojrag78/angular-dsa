import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface TreeNode {
  value: number;
  state: 'default' | 'active' | 'completed' | 'memoized';
}

@Component({
  selector: 'app-dp-visualizer',
  templateUrl: './dp-visualizer.component.html',
  styleUrls: ['./dp-visualizer.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DpVisualizerComponent implements OnInit {
  @ViewChild('recursiveTreeContainer') recursiveTreeContainer!: ElementRef;

  nValue: number | null = 5;
  animationSpeed = 500;
  selectedApproach: 'recursive' | 'memoization' | 'tabulation' = 'recursive';
  isVisualizing = false;
  isPaused = false;
  operationText = 'Select parameters and click "Calculate"';
  callStack: number[] = [];
  currentFunctionCall: number | null = null;
  memoizedValues = new Map<number, number>();
  dpTable: (number | null)[] = [];
  currentTabulationStep = 0;
  recursiveTree: TreeNode[][] = [];
  private visualizationTimeout: any = null;
  private visualizationPromise: Promise<void> | null = null;
  private visualizationResolve: (() => void) | null = null;

  ngOnInit() {
    this.resetVisualization();
  }

  async startVisualization() {
    if (this.isVisualizing || this.nValue === null) return;

    this.resetVisualization();
    this.isVisualizing = true;
    this.operationText = `Calculating fib(${this.nValue}) using ${this.selectedApproach} approach`;

    try {
      let result: number;
      switch (this.selectedApproach) {
        case 'recursive':
          result = await this.visualizeRecursiveFibonacci(this.nValue);
          break;
        case 'memoization':
          result = await this.visualizeMemoizedFibonacci(this.nValue);
          break;
        case 'tabulation':
          result = await this.visualizeTabulatedFibonacci(this.nValue);
          break;
        default:
          result = 0;
      }

      this.operationText = `fib(${this.nValue}) = ${result} (calculated using ${this.selectedApproach})`;
    } finally {
      this.isVisualizing = false;
      this.isPaused = false;
    }
  }

  async visualizeRecursiveFibonacci(n: number): Promise<number> {
    this.addToTree(n, 'active');
    this.callStack.push(n);
    this.currentFunctionCall = n;
    this.operationText = `Calculating fib(${n}) recursively`;
    await this.delay();

    if (n <= 1) {
      this.updateTreeNodeState(n, 'completed');
      this.callStack.pop();
      this.currentFunctionCall = this.callStack[this.callStack.length - 1];
      this.operationText = `Base case: fib(${n}) = ${n}`;
      await this.delay();
      return n;
    }

    this.operationText = `Breaking down fib(${n}) into fib(${n-1}) + fib(${n-2})`;
    await this.delay();

    const leftResult = await this.visualizeRecursiveFibonacci(n - 1);
    const rightResult = await this.visualizeRecursiveFibonacci(n - 2);

    const result = leftResult + rightResult;
    this.updateTreeNodeState(n, 'completed');
    this.callStack.pop();
    this.currentFunctionCall = this.callStack[this.callStack.length - 1];
    this.operationText = `Computed fib(${n}) = fib(${n-1}) + fib(${n-2}) = ${result}`;
    await this.delay();

    return result;
  }

  async visualizeMemoizedFibonacci(n: number): Promise<number> {
    this.addToTree(n, 'active');
    this.callStack.push(n);
    this.currentFunctionCall = n;
    this.operationText = `Calculating fib(${n}) with memoization`;
    await this.delay();

    if (this.memoizedValues.has(n)) {
      const memoizedValue = this.memoizedValues.get(n)!;
      this.updateTreeNodeState(n, 'memoized');
      this.callStack.pop();
      this.currentFunctionCall = this.callStack[this.callStack.length - 1];
      this.operationText = `Using memoized value for fib(${n}) = ${memoizedValue}`;
      await this.delay();
      return memoizedValue;
    }

    if (n <= 1) {
      this.memoizedValues.set(n, n);
      this.updateTreeNodeState(n, 'completed');
      this.callStack.pop();
      this.currentFunctionCall = this.callStack[this.callStack.length - 1];
      this.operationText = `Base case: fib(${n}) = ${n} (memoized)`;
      await this.delay();
      return n;
    }

    this.operationText = `Breaking down fib(${n}) into fib(${n-1}) + fib(${n-2})`;
    await this.delay();

    const leftResult = await this.visualizeMemoizedFibonacci(n - 1);
    const rightResult = await this.visualizeMemoizedFibonacci(n - 2);

    const result = leftResult + rightResult;
    this.memoizedValues.set(n, result);
    this.updateTreeNodeState(n, 'completed');
    this.callStack.pop();
    this.currentFunctionCall = this.callStack[this.callStack.length - 1];
    this.operationText = `Computed fib(${n}) = ${result} (memoized)`;
    await this.delay();

    return result;
  }

  async visualizeTabulatedFibonacci(n: number): Promise<number> {
    // Initialize DP table
    this.dpTable = new Array(n + 1).fill(null);
    this.dpTable[0] = 0;
    if (n >= 1) this.dpTable[1] = 1;
    this.currentTabulationStep = 2;

    this.operationText = 'Initialized DP table with base cases: fib(0) = 0, fib(1) = 1';
    await this.delay();

    for (let i = 2; i <= n; i++) {
      this.currentTabulationStep = i;
      this.operationText = `Calculating fib(${i}) = fib(${i-1}) + fib(${i-2})`;
      await this.delay();

      this.dpTable[i] = this.dpTable[i - 1]! + this.dpTable[i - 2]!;
      this.operationText = `Computed fib(${i}) = ${this.dpTable[i]}`;
      await this.delay();
    }

    return this.dpTable[n]!;
  }

  pauseVisualization() {
    this.isPaused = true;
    this.operationText = 'Visualization paused';
  }

  resumeVisualization() {
    this.isPaused = false;
    if (this.visualizationResolve) {
      this.visualizationResolve();
      this.visualizationResolve = null;
    }
    this.operationText = 'Resuming visualization...';
  }

  resetVisualization() {
    this.isVisualizing = false;
    this.isPaused = false;
    this.callStack = [];
    this.currentFunctionCall = null;
    this.memoizedValues = new Map();
    this.dpTable = [];
    this.currentTabulationStep = 0;
    this.recursiveTree = [];
    this.operationText = 'Select parameters and click "Calculate"';

    if (this.visualizationTimeout) {
      clearTimeout(this.visualizationTimeout);
    }
  }

  objectToArray(map: Map<number, number>): string {
    return Array.from(map.entries()).map(([k, v]) => `${k}:${v}`).join(', ');
  }

  private addToTree(value: number, state: 'active' | 'completed' | 'memoized') {
    const level = this.callStack.length - 1;
    if (!this.recursiveTree[level]) {
      this.recursiveTree[level] = [];
    }
    this.recursiveTree[level].push({ value, state });
    this.scrollTreeToBottom();
  }

  private updateTreeNodeState(value: number, state: 'active' | 'completed' | 'memoized') {
    for (const level of this.recursiveTree) {
      const node = level.find(n => n.value === value);
      if (node) {
        node.state = state;
        break;
      }
    }
    this.scrollTreeToBottom();
  }

  private scrollTreeToBottom() {
    setTimeout(() => {
      if (this.recursiveTreeContainer) {
        this.recursiveTreeContainer.nativeElement.scrollLeft = 
          this.recursiveTreeContainer.nativeElement.scrollWidth;
      }
    }, 0);
  }

  private async delay(): Promise<void> {
    await this.checkPaused();
    return new Promise(resolve => {
      this.visualizationTimeout = setTimeout(() => {
        resolve();
      }, this.animationSpeed);
    });
  }

  private async checkPaused() {
    if (this.isPaused) {
      this.operationText = 'Visualization paused - click Resume to continue';
      this.visualizationPromise = new Promise(resolve => {
        this.visualizationResolve = resolve;
      });
      await this.visualizationPromise;
    }
  }
}