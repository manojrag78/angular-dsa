import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fibonacci',
  standalone: true,
  imports: [CommonModule , FormsModule],
  templateUrl: './fibonacci.component.html',
  styleUrls: ['./fibonacci.component.scss']
})
export class FibonacciComponent {
count = 10;
  fibonacci: number[] = [];

  generateFibonacci(count: number) {
    const result = [];
    let a = 0, b = 1;

    for (let i = 0; i < count; i++) {
      result.push(a);
      [a, b] = [b, a + b];
    }

    this.fibonacci = result;
  }
}
