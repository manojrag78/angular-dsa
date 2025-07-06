import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
interface DataElement {
  value: number;
  state: 'normal' | 'push' | 'pop' | 'peek' | 'enqueue' | 'dequeue';
}

@Component({
  selector: 'app-stack-queue-visualizer',
  standalone: true,
  imports: [CommonModule , FormsModule],
  templateUrl: './stack-queue-visualizer.component.html',
  styleUrl: './stack-queue-visualizer.component.scss'
})
export class StackQueueVisualizerComponent {
  // Stack properties
  stackElements: DataElement[] = [];
  stackInputValue: number | null = null;
  stackOperationText = 'No operation performed yet';

  // Queue properties
  queueElements: DataElement[] = [];
  queueInputValue: number | null = null;
  queueOperationText = 'No operation performed yet';

  // Common properties
  maxSize = 10;
  animationSpeed = 500;
  isWorking = false;

  ngOnInit() {
    this.resetDataStructures();
  }

  resetDataStructures() {
    this.stackElements = [];
    this.queueElements = [];
    this.stackOperationText = 'Stack reset';
    this.queueOperationText = 'Queue reset';
  }

  async pushToStack() {
    if (this.stackInputValue === null || this.isWorking) return;

    this.isWorking = true;
    const newElement: DataElement = {
      value: this.stackInputValue,
      state: 'push'
    };

    this.stackOperationText = `Pushing ${this.stackInputValue} to stack...`;
    this.stackElements = [...this.stackElements, newElement];
    await this.delay();

    newElement.state = 'normal';
    this.stackElements = [...this.stackElements];
    this.stackOperationText = `${this.stackInputValue} pushed to stack`;
    this.stackInputValue = null;
    this.isWorking = false;
  }

  async popFromStack() {
    if (this.stackElements.length === 0 || this.isWorking) return;

    this.isWorking = true;
    const lastIndex = this.stackElements.length - 1;
    this.stackElements[lastIndex].state = 'pop';
    this.stackOperationText = `Popping from stack...`;
    await this.delay();

    const poppedValue = this.stackElements[lastIndex].value;
    this.stackElements = this.stackElements.slice(0, -1);
    this.stackOperationText = `${poppedValue} popped from stack`;
    this.isWorking = false;
  }

  async peekStack() {
    if (this.stackElements.length === 0 || this.isWorking) return;

    this.isWorking = true;
    const lastIndex = this.stackElements.length - 1;
    this.stackElements[lastIndex].state = 'peek';
    this.stackOperationText = `Peeking at top of stack: ${this.stackElements[lastIndex].value}`;
    await this.delay();

    this.stackElements[lastIndex].state = 'normal';
    this.stackElements = [...this.stackElements];
    this.stackOperationText = `Top element is ${this.stackElements[lastIndex].value}`;
    this.isWorking = false;
  }

  async enqueue() {
    if (this.queueInputValue === null || this.isWorking) return;

    this.isWorking = true;
    const newElement: DataElement = {
      value: this.queueInputValue,
      state: 'enqueue'
    };

    this.queueOperationText = `Enqueuing ${this.queueInputValue}...`;
    this.queueElements = [...this.queueElements, newElement];
    await this.delay();

    newElement.state = 'normal';
    this.queueElements = [...this.queueElements];
    this.queueOperationText = `${this.queueInputValue} added to queue`;
    this.queueInputValue = null;
    this.isWorking = false;
  }

  async dequeue() {
    if (this.queueElements.length === 0 || this.isWorking) return;

    this.isWorking = true;
    this.queueElements[0].state = 'dequeue';
    this.queueOperationText = `Dequeuing from front of queue...`;
    await this.delay();

    const dequeuedValue = this.queueElements[0].value;
    this.queueElements = this.queueElements.slice(1);
    this.queueOperationText = `${dequeuedValue} removed from queue`;
    this.isWorking = false;
  }

  async peekQueue() {
    if (this.queueElements.length === 0 || this.isWorking) return;

    this.isWorking = true;
    this.queueElements[0].state = 'peek';
    this.queueOperationText = `Peeking at front of queue: ${this.queueElements[0].value}`;
    await this.delay();

    this.queueElements[0].state = 'normal';
    this.queueElements = [...this.queueElements];
    this.queueOperationText = `Front element is ${this.queueElements[0].value}`;
    this.isWorking = false;
  }

  private delay(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, this.animationSpeed);
    });
  }
}
