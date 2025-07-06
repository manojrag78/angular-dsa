import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
interface LinkedListNode {
  value: number;
  state: 'default' | 'active' | 'completed' | 'error';
  highlightNext: boolean;
}
@Component({
  selector: 'app-linked-list-visualizer',
  standalone: true,
  imports: [CommonModule , FormsModule],
  templateUrl: './linked-list-visualizer.component.html',
  styleUrl: './linked-list-visualizer.component.scss'
})
export class LinkedListVisualizerComponent {

 list: LinkedListNode[] = [];
  listSize = 5;
  animationSpeed = 500;
  isWorking = false;
  isPaused = false;
  selectedOperation = 'traverse';
  newValue = 0;
  position = 0;
  searchedValue = 0;
  currentStep = 'Ready to perform operation';
  steps = 0;
  private operationTimeout: any = null;
  private operationPromise: Promise<void> | null = null;
  private operationResolve: (() => void) | null = null;

  ngOnInit() {
    this.generateNewList();
  }

  generateNewList() {
    this.list = [];
    for (let i = 0; i < this.listSize; i++) {
      this.list.push({
        value: Math.floor(Math.random() * 90) + 10, // Values between 10-99
        state: 'default',
        highlightNext: false
      });
    }
    this.resetStats();
  }

  resetStats() {
    this.steps = 0;
    this.currentStep = 'Ready to perform operation';
  }

  resetListStates() {
    this.list.forEach(node => {
      node.state = 'default';
      node.highlightNext = false;
    });
  }

  async performOperation() {
    if (this.isWorking) return;
    
    this.isWorking = true;
    this.isPaused = false;
    this.resetStats();
    this.resetListStates();
    
    switch (this.selectedOperation) {
      case 'traverse':
        await this.traverseList();
        break;
      case 'insertStart':
        await this.insertAtStart();
        break;
      case 'insertEnd':
        await this.insertAtEnd();
        break;
      case 'insertAt':
        await this.insertAtPosition();
        break;
      case 'deleteStart':
        await this.deleteFromStart();
        break;
      case 'deleteEnd':
        await this.deleteFromEnd();
        break;
      case 'deleteAt':
        await this.deleteAtPosition();
        break;
      case 'search':
        await this.searchValue();
        break;
      case 'reverse':
        await this.reverseList();
        break;
    }
    
    if (this.isWorking) {
      this.markAllAsCompleted();
    }
    this.isWorking = false;
    this.isPaused = false;
  }

  pauseOperation() {
    this.isPaused = true;
    this.currentStep = 'Operation paused';
  }

  resumeOperation() {
    this.isPaused = false;
    if (this.operationResolve) {
      this.operationResolve();
      this.operationResolve = null;
    }
    this.currentStep = 'Resuming operation...';
  }

  // ===== Linked List Operations ===== //

  async traverseList() {
    this.currentStep = 'Starting list traversal';
    await this.delay();
    
    for (let i = 0; i < this.list.length; i++) {
      if (!this.isWorking) return;
      await this.checkPaused();
      
      this.steps++;
      this.list[i].state = 'active';
      this.currentStep = `Visiting node ${i} with value ${this.list[i].value}`;
      await this.delay();
      
      if (i < this.list.length - 1) {
        this.list[i].highlightNext = true;
        this.currentStep = `Moving to next node from position ${i}`;
        await this.delay();
        this.list[i].highlightNext = false;
      }
      
      this.list[i].state = 'completed';
    }
    
    this.currentStep = 'List traversal completed';
  }

  async insertAtStart() {
    this.steps++;
    this.currentStep = `Preparing to insert ${this.newValue} at the beginning`;
    await this.delay();
    
    // Highlight first node
    if (this.list.length > 0) {
      this.list[0].state = 'active';
      this.currentStep = `Current head node with value ${this.list[0].value}`;
      await this.delay();
    }
    
    // Create new node
    const newNode: LinkedListNode = {
      value: this.newValue,
      state: 'active',
      highlightNext: this.list.length > 0
    };
    
    this.currentStep = `Creating new node with value ${this.newValue}`;
    await this.delay();
    
    // Insert at start
    this.list.unshift(newNode);
    this.currentStep = `New node inserted at the beginning`;
    await this.delay();
    
    // Update visualization
    if (this.list.length > 1) {
      this.list[0].highlightNext = true;
      this.list[1].state = 'default';
      await this.delay();
      this.list[0].highlightNext = false;
    }
    
    this.list[0].state = 'completed';
    this.currentStep = 'Insertion at start completed';
  }

  async insertAtEnd() {
    this.steps++;
    this.currentStep = `Preparing to insert ${this.newValue} at the end`;
    await this.delay();
    
    if (this.list.length > 0) {
      // Traverse to end
      for (let i = 0; i < this.list.length; i++) {
        if (!this.isWorking) return;
        await this.checkPaused();
        
        this.list[i].state = 'active';
        this.currentStep = `Visiting node ${i} with value ${this.list[i].value}`;
        await this.delay();
        
        if (i < this.list.length - 1) {
          this.list[i].highlightNext = true;
          this.currentStep = `Moving to next node from position ${i}`;
          await this.delay();
          this.list[i].highlightNext = false;
          this.list[i].state = 'default';
        }
      }
      
      this.steps++;
      this.currentStep = `Reached end of list at position ${this.list.length - 1}`;
      await this.delay();
    }
    
    // Create new node
    const newNode: LinkedListNode = {
      value: this.newValue,
      state: 'active',
      highlightNext: false
    };
    
    this.currentStep = `Creating new node with value ${this.newValue}`;
    await this.delay();
    
    // Insert at end
    this.list.push(newNode);
    this.currentStep = `New node inserted at the end`;
    await this.delay();
    
    if (this.list.length > 1) {
      this.list[this.list.length - 2].highlightNext = true;
      await this.delay();
      this.list[this.list.length - 2].highlightNext = false;
    }
    
    this.list[this.list.length - 1].state = 'completed';
    this.currentStep = 'Insertion at end completed';
  }

  async insertAtPosition() {
    if (this.position < 0 || this.position > this.list.length) {
      this.currentStep = 'Invalid position for insertion';
      this.isWorking = false;
      return;
    }
    
    this.steps++;
    this.currentStep = `Preparing to insert ${this.newValue} at position ${this.position}`;
    await this.delay();
    
    if (this.position === 0) {
      await this.insertAtStart();
      return;
    }
    
    if (this.position === this.list.length) {
      await this.insertAtEnd();
      return;
    }
    
    // Traverse to position
    for (let i = 0; i < this.position; i++) {
      if (!this.isWorking) return;
      await this.checkPaused();
      
      this.list[i].state = 'active';
      this.currentStep = `Visiting node ${i} with value ${this.list[i].value}`;
      await this.delay();
      
      if (i < this.position - 1) {
        this.list[i].highlightNext = true;
        this.currentStep = `Moving to next node from position ${i}`;
        await this.delay();
        this.list[i].highlightNext = false;
        this.list[i].state = 'default';
      }
    }
    
    this.steps++;
    this.currentStep = `Reached insertion position ${this.position}`;
    await this.delay();
    
    // Create new node
    const newNode: LinkedListNode = {
      value: this.newValue,
      state: 'active',
      highlightNext: true
    };
    
    this.currentStep = `Creating new node with value ${this.newValue}`;
    await this.delay();
    
    // Insert at position
    this.list.splice(this.position, 0, newNode);
    this.currentStep = `New node inserted at position ${this.position}`;
    await this.delay();
    
    // Update visualization
    this.list[this.position - 1].highlightNext = true;
    this.list[this.position].highlightNext = false;
    this.list[this.position + 1].state = 'default';
    await this.delay();
    
    this.list[this.position - 1].highlightNext = false;
    this.list[this.position].state = 'completed';
    this.currentStep = 'Insertion at position completed';
  }

  async deleteFromStart() {
    if (this.list.length === 0) {
      this.currentStep = 'List is empty, nothing to delete';
      this.isWorking = false;
      return;
    }
    
    this.steps++;
    this.list[0].state = 'active';
    this.currentStep = `Preparing to delete first node with value ${this.list[0].value}`;
    await this.delay();
    
    if (this.list.length > 1) {
      this.list[0].highlightNext = true;
      this.currentStep = `Node points to next node with value ${this.list[1].value}`;
      await this.delay();
    }
    
    this.list.shift();
    this.currentStep = 'First node deleted';
    await this.delay();
    
    if (this.list.length > 0) {
      this.list[0].state = 'completed';
    }
    this.currentStep = 'Deletion from start completed';
  }

  async deleteFromEnd() {
    if (this.list.length === 0) {
      this.currentStep = 'List is empty, nothing to delete';
      this.isWorking = false;
      return;
    }
    
    this.steps++;
    this.currentStep = 'Preparing to delete last node';
    await this.delay();
    
    if (this.list.length === 1) {
      this.list[0].state = 'active';
      this.currentStep = `Deleting the only node with value ${this.list[0].value}`;
      await this.delay();
      this.list.pop();
      this.currentStep = 'List is now empty';
      this.isWorking = false;
      return;
    }
    
    // Traverse to second last node
    for (let i = 0; i < this.list.length - 2; i++) {
      if (!this.isWorking) return;
      await this.checkPaused();
      
      this.list[i].state = 'active';
      this.currentStep = `Visiting node ${i} with value ${this.list[i].value}`;
      await this.delay();
      
      this.list[i].highlightNext = true;
      this.currentStep = `Moving to next node from position ${i}`;
      await this.delay();
      this.list[i].highlightNext = false;
      this.list[i].state = 'default';
    }
    
    // Highlight last two nodes
    const lastIndex = this.list.length - 1;
    this.list[lastIndex - 1].state = 'active';
    this.list[lastIndex - 1].highlightNext = true;
    this.list[lastIndex].state = 'active';
    this.currentStep = `Found last node with value ${this.list[lastIndex].value}`;
    await this.delay();
    
    this.list.pop();
    this.list[lastIndex - 1].highlightNext = false;
    this.list[lastIndex - 1].state = 'completed';
    this.currentStep = 'Last node deleted';
    await this.delay();
    
    this.currentStep = 'Deletion from end completed';
  }

  async deleteAtPosition() {
    if (this.position < 0 || this.position >= this.list.length) {
      this.currentStep = 'Invalid position for deletion';
      this.isWorking = false;
      return;
    }
    
    this.steps++;
    this.currentStep = `Preparing to delete node at position ${this.position}`;
    await this.delay();
    
    if (this.position === 0) {
      await this.deleteFromStart();
      return;
    }
    
    if (this.position === this.list.length - 1) {
      await this.deleteFromEnd();
      return;
    }
    
    // Traverse to position
    for (let i = 0; i < this.position; i++) {
      if (!this.isWorking) return;
      await this.checkPaused();
      
      this.list[i].state = 'active';
      this.currentStep = `Visiting node ${i} with value ${this.list[i].value}`;
      await this.delay();
      
      if (i < this.position - 1) {
        this.list[i].highlightNext = true;
        this.currentStep = `Moving to next node from position ${i}`;
        await this.delay();
        this.list[i].highlightNext = false;
        this.list[i].state = 'default';
      }
    }
    
    // Highlight nodes around deletion point
    this.list[this.position - 1].highlightNext = true;
    this.list[this.position].state = 'active';
    this.currentStep = `Found node to delete with value ${this.list[this.position].value}`;
    await this.delay();
    
    this.list.splice(this.position, 1);
    this.list[this.position - 1].highlightNext = true;
    this.list[this.position].state = 'active';
    this.currentStep = `Node deleted, connecting previous node to next node`;
    await this.delay();
    
    this.list[this.position - 1].highlightNext = false;
    this.list[this.position - 1].state = 'completed';
    this.list[this.position].state = 'completed';
    this.currentStep = 'Deletion at position completed';
  }

  async searchValue() {
    this.steps++;
    this.currentStep = `Searching for value ${this.searchValue}`;
    await this.delay();
    
    for (let i = 0; i < this.list.length; i++) {
      if (!this.isWorking) return;
      await this.checkPaused();
      
      this.list[i].state = 'active';
      this.currentStep = `Checking node ${i} with value ${this.list[i].value}`;
      await this.delay();
      
      if (this.list[i].value === this.searchedValue) {
        this.list[i].state = 'completed';
        this.currentStep = `Found value ${this.searchedValue} at position ${i}`;
        await this.delay();
        return;
      }
      
      if (i < this.list.length - 1) {
        this.list[i].highlightNext = true;
        this.currentStep = `Moving to next node from position ${i}`;
        await this.delay();
        this.list[i].highlightNext = false;
      }
      
      this.list[i].state = 'default';
    }
    
    this.currentStep = `Value ${this.searchValue} not found in the list`;
    await this.delay();
  }

  async reverseList() {
    this.steps++;
    this.currentStep = 'Starting list reversal';
    await this.delay();
    
    let left = 0;
    let right = this.list.length - 1;
    
    while (left < right) {
      if (!this.isWorking) return;
      await this.checkPaused();
      
      // Highlight nodes to swap
      this.list[left].state = 'active';
      this.list[right].state = 'active';
      this.currentStep = `Swapping nodes at positions ${left} and ${right}`;
      await this.delay();
      
      // Swap values
      const temp = this.list[left].value;
      this.list[left].value = this.list[right].value;
      this.list[right].value = temp;
      
      // Update visualization
      this.list[left].state = 'completed';
      this.list[right].state = 'completed';
      this.currentStep = `Nodes swapped successfully`;
      await this.delay();
      
      left++;
      right--;
    }
    
    if (left === right) {
      this.list[left].state = 'completed';
    }
    
    this.currentStep = 'List reversal completed';
    await this.delay();
  }

  // ===== Helper Methods ===== //

  private async checkPaused() {
    if (this.isPaused) {
      this.currentStep = 'Paused - click Resume to continue';
      this.operationPromise = new Promise(resolve => {
        this.operationResolve = resolve;
      });
      await this.operationPromise;
    }
  }

  private delay(): Promise<void> {
    return new Promise(resolve => {
      this.operationTimeout = setTimeout(() => {
        resolve();
      }, this.animationSpeed);
    });
  }

  markAllAsCompleted() {
    this.list.forEach(node => node.state = 'completed');
    this.currentStep = 'Operation completed!';
  }

  getOperationName(): string {
    switch (this.selectedOperation) {
      case 'traverse': return 'List Traversal';
      case 'insertStart': return 'Insert at Start';
      case 'insertEnd': return 'Insert at End';
      case 'insertAt': return 'Insert at Position';
      case 'deleteStart': return 'Delete from Start';
      case 'deleteEnd': return 'Delete from End';
      case 'deleteAt': return 'Delete at Position';
      case 'search': return 'Search Value';
      case 'reverse': return 'Reverse List';
      default: return 'Linked List Operation';
    }
  }

  getOperationDescription(): string {
    switch (this.selectedOperation) {
      case 'traverse':
        return 'Visiting each node of the linked list sequentially from head to tail.';
      case 'insertStart':
        return 'Adding a new node at the beginning of the linked list, making it the new head.';
      case 'insertEnd':
        return 'Adding a new node at the end of the linked list, making it the new tail.';
      case 'insertAt':
        return 'Adding a new node at a specific position in the linked list.';
      case 'deleteStart':
        return 'Removing the first node (head) of the linked list.';
      case 'deleteEnd':
        return 'Removing the last node (tail) of the linked list.';
      case 'deleteAt':
        return 'Removing a node from a specific position in the linked list.';
      case 'search':
        return 'Looking for a specific value in the linked list by checking each node.';
      case 'reverse':
        return 'Reversing the order of nodes in the linked list.';
      default:
        return 'Select an operation to see its description.';
    }
  }
}
