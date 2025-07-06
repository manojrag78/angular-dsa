import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sorting-algorithms',
  standalone: true,
  imports: [CommonModule , FormsModule],
  templateUrl: './sorting-algorithms.component.html',
  styleUrl: './sorting-algorithms.component.scss'
})
export class SortingAlgorithmsComponent {
array: { value: number, state: string }[] = [];
  arraySize = 15;
  sortSpeed = 100;
  isSorting = false;
  isPaused = false;
  selectedAlgorithm = 'bubble';
  comparisons = 0;
  swaps = 0;
  iterations = 0;
  currentOperation = '';
  private sortingTimeout: any = null;
  private sortingPromise: Promise<void> | null = null;
  private sortingResolve: (() => void) | null = null;

  ngOnInit() {
    this.generateNewArray();
  }

  generateNewArray() {
    this.array = [];
    for (let i = 0; i < this.arraySize; i++) {
      this.array.push({
        value: Math.floor(Math.random() * 95) + 5, // Values between 5-100
        state: 'default'
      });
    }
    this.resetStats();
  }

  resetStats() {
    this.comparisons = 0;
    this.swaps = 0;
    this.iterations = 0;
    this.currentOperation = 'Ready to sort';
  }

  async startSorting() {
    if (this.isSorting) return;
    
    this.isSorting = true;
    this.isPaused = false;
    this.resetStats();
    
    switch (this.selectedAlgorithm) {
      case 'bubble':
        await this.bubbleSort();
        break;
      case 'selection':
        await this.selectionSort();
        break;
      case 'insertion':
        await this.insertionSort();
        break;
      case 'merge':
        await this.mergeSort();
        break;
      case 'quick':
        await this.quickSort();
        break;
      case 'heap':
        await this.heapSort();
        break;
    }
    
    if (this.isSorting) {
      this.markAllAsSorted();
    }
    this.isSorting = false;
    this.isPaused = false;
  }

  pauseSorting() {
    this.isPaused = true;
    this.currentOperation = 'Sorting paused';
  }

  resumeSorting() {
    this.isPaused = false;
    if (this.sortingResolve) {
      this.sortingResolve();
      this.sortingResolve = null;
    }
    this.currentOperation = 'Resuming sorting...';
  }

  stopSorting() {
    if (this.sortingTimeout) {
      clearTimeout(this.sortingTimeout);
    }
    this.isSorting = false;
    this.isPaused = false;
    this.currentOperation = 'Sorting stopped';
    this.resetBarStates();
  }

  // ===== Sorting Algorithms ===== //

  // Bubble Sort
  async bubbleSort() {
    let n = this.array.length;
    let swapped: boolean;
    
    do {
      swapped = false;
      this.iterations++;
      this.currentOperation = `Iteration ${this.iterations}: Checking elements`;
      
      for (let i = 0; i < n - 1; i++) {
        if (!this.isSorting) return;
        await this.checkPaused();
        
        // Highlight comparison
        this.array[i].state = 'compared';
        this.array[i + 1].state = 'compared';
        this.comparisons++;
        this.currentOperation = `Comparing ${this.array[i].value} and ${this.array[i + 1].value}`;
        await this.delay();
        
        if (this.array[i].value > this.array[i + 1].value) {
          // Swap elements
          [this.array[i], this.array[i + 1]] = [this.array[i + 1], this.array[i]];
          this.swaps++;
          swapped = true;
          
          // Mark as swapped
          this.array[i].state = 'swapped';
          this.array[i + 1].state = 'swapped';
          this.currentOperation = `Swapped ${this.array[i].value} and ${this.array[i + 1].value}`;
          await this.delay();
        }
        
        // Reset states
        if (this.array[i].state !== 'sorted') this.array[i].state = 'default';
        if (this.array[i + 1].state !== 'sorted') this.array[i + 1].state = 'default';
      }
      
      // Mark last element as sorted
      this.array[n - 1].state = 'sorted';
      n--;
      
    } while (swapped && this.isSorting);
  }

  // Selection Sort
  async selectionSort() {
    const n = this.array.length;
    
    for (let i = 0; i < n - 1; i++) {
      if (!this.isSorting) return;
      await this.checkPaused();
      
      let minIndex = i;
      this.array[i].state = 'compared';
      this.iterations++;
      this.currentOperation = `Iteration ${this.iterations}: Finding minimum`;
      
      for (let j = i + 1; j < n; j++) {
        if (!this.isSorting) return;
        await this.checkPaused();
        
        this.array[j].state = 'compared';
        this.comparisons++;
        this.currentOperation = `Comparing ${this.array[j].value} with current minimum`;
        await this.delay();
        
        if (this.array[j].value < this.array[minIndex].value) {
          if (minIndex !== i) this.array[minIndex].state = 'default';
          minIndex = j;
          this.array[minIndex].state = 'swapped';
          await this.delay();
        } else {
          this.array[j].state = 'default';
        }
      }
      
      if (minIndex !== i) {
        [this.array[i], this.array[minIndex]] = [this.array[minIndex], this.array[i]];
        this.swaps++;
        await this.delay();
      }
      
      this.array[i].state = 'sorted';
      this.array[minIndex].state = 'default';
    }
    
    this.array[n - 1].state = 'sorted';
  }

  // Insertion Sort
  async insertionSort() {
    const n = this.array.length;
    
    for (let i = 1; i < n; i++) {
      if (!this.isSorting) return;
      await this.checkPaused();
      
      let key = this.array[i].value;
      let j = i - 1;
      this.iterations++;
      
      this.array[i].state = 'compared';
      this.currentOperation = `Inserting ${key} into sorted portion`;
      await this.delay();
      
      while (j >= 0 && this.array[j].value > key) {
        if (!this.isSorting) return;
        await this.checkPaused();
        
        this.comparisons++;
        this.array[j].state = 'compared';
        this.array[j + 1].state = 'swapped';
        this.currentOperation = `Shifting ${this.array[j].value} to make space`;
        await this.delay();
        
        this.array[j + 1].value = this.array[j].value;
        this.swaps++;
        j--;
        
        await this.delay();
      }
      
      this.array[j + 1].value = key;
      this.array[i].state = 'sorted';
      
      // Reset states
      for (let k = 0; k <= i; k++) {
        this.array[k].state = 'default';
      }
      this.array[j + 1].state = 'sorted';
    }
    
    this.markAllAsSorted();
  }

  // Merge Sort
  async mergeSort() {
    await this.mergeSortHelper(0, this.array.length - 1);
    if (this.isSorting) {
      this.markAllAsSorted();
    }
  }

  private async mergeSortHelper(l: number, r: number) {
    if (l < r) {
      const m = Math.floor((l + r) / 2);
      
      await this.mergeSortHelper(l, m);
      await this.mergeSortHelper(m + 1, r);
      
      await this.merge(l, m, r);
    }
  }

  private async merge(l: number, m: number, r: number) {
    if (!this.isSorting) return;
    await this.checkPaused();
    
    this.iterations++;
    this.currentOperation = `Merging subarrays ${l}-${m} and ${m+1}-${r}`;
    
    const n1 = m - l + 1;
    const n2 = r - m;
    const L = new Array(n1);
    const R = new Array(n2);
    
    // Highlight the subarrays being merged
    for (let i = 0; i < n1; i++) {
      L[i] = this.array[l + i].value;
      this.array[l + i].state = 'compared';
    }
    for (let j = 0; j < n2; j++) {
      R[j] = this.array[m + 1 + j].value;
      this.array[m + 1 + j].state = 'compared';
    }
    await this.delay();
    
    let i = 0, j = 0, k = l;
    
    while (i < n1 && j < n2) {
      if (!this.isSorting) return;
      await this.checkPaused();
      
      this.comparisons++;
      this.currentOperation = `Comparing ${L[i]} and ${R[j]}`;
      await this.delay();
      
      if (L[i] <= R[j]) {
        this.array[k].value = L[i];
        this.array[k].state = 'swapped';
        i++;
      } else {
        this.array[k].value = R[j];
        this.array[k].state = 'swapped';
        j++;
      }
      this.swaps++;
      k++;
      
      await this.delay();
    }
    
    while (i < n1) {
      if (!this.isSorting) return;
      await this.checkPaused();
      
      this.array[k].value = L[i];
      this.array[k].state = 'swapped';
      i++;
      k++;
      this.swaps++;
      await this.delay();
    }
    
    while (j < n2) {
      if (!this.isSorting) return;
      await this.checkPaused();
      
      this.array[k].value = R[j];
      this.array[k].state = 'swapped';
      j++;
      k++;
      this.swaps++;
      await this.delay();
    }
    
    // Reset states
    for (let x = l; x <= r; x++) {
      this.array[x].state = 'default';
    }
  }

  // Quick Sort
  async quickSort() {
    await this.quickSortHelper(0, this.array.length - 1);
    if (this.isSorting) {
      this.markAllAsSorted();
    }
  }

  private async quickSortHelper(low: number, high: number) {
    if (low < high) {
      const pi = await this.partition(low, high);
      
      await this.quickSortHelper(low, pi - 1);
      await this.quickSortHelper(pi + 1, high);
    } else if (low === high) {
      this.array[low].state = 'sorted';
      await this.delay();
    }
  }

  private async partition(low: number, high: number): Promise<number> {
    if (!this.isSorting) return -1;
    await this.checkPaused();
    
    this.iterations++;
    const pivot = this.array[high].value;
    this.array[high].state = 'compared';
    this.currentOperation = `Partitioning with pivot ${pivot}`;
    await this.delay();
    
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      if (!this.isSorting) return -1;
      await this.checkPaused();
      
      this.array[j].state = 'compared';
      this.comparisons++;
      this.currentOperation = `Comparing ${this.array[j].value} with pivot ${pivot}`;
      await this.delay();
      
      if (this.array[j].value < pivot) {
        i++;
        
        [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
        this.array[i].state = 'swapped';
        this.array[j].state = 'swapped';
        this.swaps++;
        this.currentOperation = `Swapped ${this.array[i].value} and ${this.array[j].value}`;
        await this.delay();
      }
      
      this.array[j].state = 'default';
    }
    
    [this.array[i + 1], this.array[high]] = [this.array[high], this.array[i + 1]];
    this.array[i + 1].state = 'sorted';
    this.array[high].state = 'default';
    this.swaps++;
    this.currentOperation = `Placed pivot ${pivot} at position ${i + 1}`;
    await this.delay();
    
    return i + 1;
  }

  // Heap Sort
  async heapSort() {
    const n = this.array.length;
    
    // Build heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      if (!this.isSorting) return;
      await this.checkPaused();
      await this.heapify(n, i);
    }
    
    // Extract elements from heap
    for (let i = n - 1; i > 0; i--) {
      if (!this.isSorting) return;
      await this.checkPaused();
      
      this.iterations++;
      [this.array[0], this.array[i]] = [this.array[i], this.array[0]];
      this.array[i].state = 'sorted';
      this.swaps++;
      this.currentOperation = `Moving largest element ${this.array[i].value} to end`;
      await this.delay();
      
      await this.heapify(i, 0);
    }
    
    this.array[0].state = 'sorted';
  }

  private async heapify(n: number, i: number) {
    if (!this.isSorting) return;
    await this.checkPaused();
    
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    // Highlight nodes being compared
    this.array[i].state = 'compared';
    if (left < n) this.array[left].state = 'compared';
    if (right < n) this.array[right].state = 'compared';
    this.currentOperation = `Heapifying node ${i}`;
    await this.delay();
    
    if (left < n && this.array[left].value > this.array[largest].value) {
      largest = left;
    }
    
    if (right < n && this.array[right].value > this.array[largest].value) {
      largest = right;
    }
    
    this.comparisons += 2;
    
    if (largest !== i) {
      [this.array[i], this.array[largest]] = [this.array[largest], this.array[i]];
      this.swaps++;
      this.currentOperation = `Swapped ${this.array[i].value} and ${this.array[largest].value}`;
      await this.delay();
      
      await this.heapify(n, largest);
    }
    
    // Reset states
    this.array[i].state = 'default';
    if (left < n) this.array[left].state = 'default';
    if (right < n) this.array[right].state = 'default';
  }

  // ===== Helper Methods ===== //

  private async checkPaused() {
    if (this.isPaused) {
      this.currentOperation = 'Paused - click Resume to continue';
      this.sortingPromise = new Promise(resolve => {
        this.sortingResolve = resolve;
      });
      await this.sortingPromise;
    }
  }

  private delay(): Promise<void> {
    return new Promise(resolve => {
      this.sortingTimeout = setTimeout(() => {
        resolve();
      }, this.sortSpeed);
    });
  }

  getBarColor(index: number): string {
    const item = this.array[index];
    if (!item) return '#3B82F6'; // default blue
    
    switch (item.state) {
      case 'compared': return '#F59E0B'; // yellow
      case 'swapped': return '#EF4444';  // red
      case 'sorted': return '#10B981';   // green
      default: return '#3B82F6';        // blue
    }
  }

  resetBarStates() {
    this.array.forEach(item => {
      if (item.state !== 'sorted') {
        item.state = 'default';
      }
    });
  }

  markAllAsSorted() {
    this.array.forEach(item => item.state = 'sorted');
    this.currentOperation = 'Sorting completed!';
  }

  getAlgorithmName(): string {
    switch (this.selectedAlgorithm) {
      case 'bubble': return 'Bubble Sort';
      case 'selection': return 'Selection Sort';
      case 'insertion': return 'Insertion Sort';
      case 'merge': return 'Merge Sort';
      case 'quick': return 'Quick Sort';
      case 'heap': return 'Heap Sort';
      default: return 'Sorting Algorithm';
    }
  }

  getAlgorithmDescription(): string {
    switch (this.selectedAlgorithm) {
      case 'bubble':
        return 'Repeatedly swaps adjacent elements if they are in the wrong order. Smaller elements "bubble" to the top of the list.';
      case 'selection':
        return 'Repeatedly finds the minimum element from the unsorted part and puts it at the beginning.';
      case 'insertion':
        return 'Builds the final sorted array one item at a time by inserting each element into its proper position.';
      case 'merge':
        return 'Divides the array into halves, sorts them recursively, and then merges the sorted halves.';
      case 'quick':
        return 'Selects a "pivot" element and partitions the array into elements less than and greater than the pivot.';
      case 'heap':
        return 'Converts the array into a max-heap to repeatedly extract the maximum element.';
      default:
        return 'Select an algorithm to see its description.';
    }
  }
}