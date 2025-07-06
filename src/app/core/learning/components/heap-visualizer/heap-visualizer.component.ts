import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';

interface HeapNode {
  value: number;
  index: number;
  state: 'default' | 'active' | 'visited' | 'processing' | 'compared';
  x?: number;
  y?: number;
}

interface HeapEdge {
  from: number;
  to: number;
  path: string;
  state: 'default' | 'active' | 'visited';
}

interface HeapLevel {
  nodes: HeapNode[];
  level: number;
}

@Component({
  selector: 'app-heap-visualizer',
  templateUrl: './heap-visualizer.component.html',
  styleUrls: ['./heap-visualizer.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class HeapVisualizerComponent implements OnInit {
  @ViewChild('heapSvg') heapSvg!: ElementRef;

  heap: number[] = [];
  heapType: 'min' | 'max' = 'min';
  animationSpeed = 500;
  isWorking = false;
  isPaused = false;
  operationValue: number | null = null;
  operationText = 'Select an operation to begin';
  currentStep = '';
  swappedNodes: number[] = [];
  comparedNodes: number[] = [];
  highlightedIndices: number[] = [];
  edges: HeapEdge[] = [];
  heapLevels: HeapLevel[] = [];
  nodePositions: {[key: number]: {x: number, y: number}} = {};
  
  private visualizationTimeout: any = null;
  private visualizationPromise: Promise<void> | null = null;
  private visualizationResolve: (() => void) | null = null;

  ngOnInit() {
    this.resetHeap();
  }

  async insertValue() {
    if (this.operationValue === null || this.isWorking) return;

    this.isWorking = true;
    this.resetOperationState();
    this.operationText = `Inserting ${this.operationValue} into ${this.heapType}-heap`;
    await this.delay();

    // Add to the end of the heap
    this.heap.push(this.operationValue);
    const index = this.heap.length - 1;
    this.highlightNodes([index], 'processing');
    this.updateHeapVisualization();
    this.operationText = `Added ${this.operationValue} at position ${index}`;
    await this.delay();

    // Bubble up
    await this.bubbleUp(index);

    this.resetNodeStates();
    this.operationText = `Inserted ${this.operationValue} into ${this.heapType}-heap`;
    this.operationValue = null;
    this.isWorking = false;
  }

  async extractRoot() {
    if (this.heap.length === 0 || this.isWorking) return;

    this.isWorking = true;
    this.resetOperationState();
    this.operationText = `Extracting root from ${this.heapType}-heap`;
    await this.delay();

    if (this.heap.length === 1) {
      const root = this.heap.pop()!;
      this.updateHeapVisualization();
      this.operationText = `Extracted root value ${root} (heap is now empty)`;
      await this.delay();
      this.isWorking = false;
      return;
    }

    // Highlight root
    this.highlightNodes([0], 'processing');
    const root = this.heap[0];
    this.operationText = `Root value is ${root}`;
    await this.delay();

    // Move last element to root
    const last = this.heap.pop()!;
    this.heap[0] = last;
    this.highlightNodes([0], 'processing');
    this.updateHeapVisualization();
    this.operationText = `Moved last element (${last}) to root position`;
    await this.delay();

    // Bubble down
    await this.bubbleDown(0);

    this.resetNodeStates();
    this.operationText = `Extracted root value ${root}`;
    this.isWorking = false;
  }

  async heapify() {
    if (this.heap.length === 0 || this.isWorking) return;

    this.isWorking = true;
    this.resetOperationState();
    this.operationText = `Checking heap property from root`;
    await this.delay();

    await this.bubbleDown(0);

    this.resetNodeStates();
    this.operationText = `Heap property restored`;
    this.isWorking = false;
  }

  async buildHeap() {
    if (this.isWorking) return;

    this.isWorking = true;
    this.resetOperationState();
    this.operationText = `Building ${this.heapType}-heap from array`;
    await this.delay();

    // Start from the last non-leaf node and heapify each
    const startIdx = Math.floor(this.heap.length / 2) - 1;
    for (let i = startIdx; i >= 0; i--) {
      this.currentStep = `Heapifying at index ${i}`;
      this.highlightNodes([i], 'processing');
      await this.delay();
      await this.bubbleDown(i);
    }

    this.resetNodeStates();
    this.operationText = `${this.heapType}-heap construction complete`;
    this.isWorking = false;
  }

  generateRandomHeap() {
    this.resetHeap();
    const size = Math.floor(Math.random() * 7) + 5; // 5-11 elements
    const values = new Set<number>();

    while (values.size < size) {
      values.add(Math.floor(Math.random() * 100) + 1);
    }

    this.heap = Array.from(values);
    this.updateHeapVisualization();
    this.operationText = `Generated random array with ${size} elements`;
  }

  resetHeap() {
    this.heap = [];
    this.resetOperationState();
    this.updateHeapVisualization();
    this.operationText = `New ${this.heapType}-heap created`;
  }

  pauseOperation() {
    this.isPaused = true;
    this.operationText = 'Operation paused';
  }

  resumeOperation() {
    this.isPaused = false;
    if (this.visualizationResolve) {
      this.visualizationResolve();
      this.visualizationResolve = null;
    }
    this.operationText = 'Resuming operation...';
  }

  private async bubbleUp(index: number) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      this.highlightNodes([parentIndex, index], 'compared');
      this.currentStep = `Comparing with parent (${this.heap[parentIndex]})`;
      this.comparedNodes = [this.heap[parentIndex], this.heap[index]];
      await this.delay();

      const shouldSwap = this.heapType === 'min' 
        ? this.heap[index] < this.heap[parentIndex]
        : this.heap[index] > this.heap[parentIndex];

      if (shouldSwap) {
        this.swappedNodes = [this.heap[parentIndex], this.heap[index]];
        this.currentStep = `Swapping with parent (${this.heap[parentIndex]})`;
        await this.delay();

        [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
        this.highlightNodes([parentIndex, index], 'processing');
        this.updateHeapVisualization();
        await this.delay();

        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private async bubbleDown(index: number) {
    const length = this.heap.length;
    let current = index;

    while (true) {
      const left = 2 * current + 1;
      const right = 2 * current + 2;
      let candidate = current;

      // Highlight current node and children
      const nodesToHighlight = [current];
      if (left < length) nodesToHighlight.push(left);
      if (right < length) nodesToHighlight.push(right);
      this.highlightNodes(nodesToHighlight, 'compared');
      this.currentStep = `Checking heap property at index ${current}`;
      await this.delay();

      // Find which child to potentially swap with
      if (left < length) {
        const leftShouldSwap = this.heapType === 'min' 
          ? this.heap[left] < this.heap[candidate]
          : this.heap[left] > this.heap[candidate];
        if (leftShouldSwap) candidate = left;
      }

      if (right < length) {
        const rightShouldSwap = this.heapType === 'min' 
          ? this.heap[right] < this.heap[candidate]
          : this.heap[right] > this.heap[candidate];
        if (rightShouldSwap) candidate = right;
      }

      if (candidate !== current) {
        this.swappedNodes = [this.heap[current], this.heap[candidate]];
        this.currentStep = `Swapping with child (${this.heap[candidate]})`;
        await this.delay();

        [this.heap[current], this.heap[candidate]] = [this.heap[candidate], this.heap[current]];
        this.highlightNodes([current, candidate], 'processing');
        this.updateHeapVisualization();
        await this.delay();

        current = candidate;
      } else {
        break;
      }
    }
  }

  private updateHeapVisualization() {
    this.calculateNodePositions();
    this.generateEdges();
    this.updateHeapLevels();
  }

  private calculateNodePositions() {
    this.nodePositions = {};
    if (this.heap.length === 0) return;

    const nodeSize = 64;
    const levelHeight = 100;
    const svgWidth = this.heapSvg?.nativeElement?.clientWidth || 800;
    
    let currentLevel = 0;
    let nodesInLevel = 1;
    let nodesProcessed = 0;

    while (nodesProcessed < this.heap.length) {
      const levelStart = nodesProcessed;
      const levelEnd = Math.min(nodesProcessed + nodesInLevel, this.heap.length);
      const levelWidth = (levelEnd - levelStart) * nodeSize * 2;
      const startX = (svgWidth - levelWidth) / 2;

      for (let i = levelStart; i < levelEnd; i++) {
        const x = startX + (i - levelStart) * (nodeSize * 2);
        const y = 50 + currentLevel * levelHeight;
        this.nodePositions[i] = { x, y };
      }

      nodesProcessed = levelEnd;
      currentLevel++;
      nodesInLevel *= 2;
    }
  }

  private generateEdges() {
    this.edges = [];
    for (let i = 0; i < this.heap.length; i++) {
      const leftChild = 2 * i + 1;
      const rightChild = 2 * i + 2;

      if (leftChild < this.heap.length) {
        this.edges.push(this.createEdge(i, leftChild));
      }
      if (rightChild < this.heap.length) {
        this.edges.push(this.createEdge(i, rightChild));
      }
    }
  }

  private createEdge(from: number, to: number): HeapEdge {
    const fromPos = this.nodePositions[from];
    const toPos = this.nodePositions[to];
    const midY = (fromPos.y + toPos.y) / 2;
    const curveFactor = 20;
    
    return {
      from,
      to,
      path: `M${fromPos.x + 32},${fromPos.y + 32} Q${fromPos.x + 32},${midY + curveFactor} ${toPos.x + 32},${toPos.y + 32}`,
      state: this.highlightedIndices.includes(from) || this.highlightedIndices.includes(to) ? 'active' : 'default'
    };
  }

  private updateHeapLevels() {
    const levels: HeapLevel[] = [];
    if (this.heap.length === 0) {
      this.heapLevels = levels;
      return;
    }

    let currentLevel = 0;
    let levelStart = 0;
    let levelSize = 1;

    while (levelStart < this.heap.length) {
      const levelEnd = Math.min(levelStart + levelSize, this.heap.length);
      const nodes: HeapNode[] = [];

      for (let i = levelStart; i < levelEnd; i++) {
        nodes.push({
          value: this.heap[i],
          index: i,
          state: this.highlightedIndices.includes(i) ? 'active' : 'default',
          ...this.nodePositions[i]
        });
      }

      levels.push({
        nodes: nodes,
        level: currentLevel
      });

      levelStart += levelSize;
      levelSize *= 2;
      currentLevel++;
    }

    this.heapLevels = levels;
  }

  private highlightNodes(indices: number[], state: 'active' | 'visited' | 'processing' | 'compared') {
    this.highlightedIndices = indices;
    this.updateHeapVisualization();
  }

  private resetNodeStates() {
    this.highlightedIndices = [];
    this.swappedNodes = [];
    this.comparedNodes = [];
    this.currentStep = '';
    this.updateHeapVisualization();
  }

  private resetOperationState() {
    this.resetNodeStates();
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
      this.operationText = 'Operation paused - click Resume to continue';
      this.visualizationPromise = new Promise(resolve => {
        this.visualizationResolve = resolve;
      });
      await this.visualizationPromise;
    }
  }
}