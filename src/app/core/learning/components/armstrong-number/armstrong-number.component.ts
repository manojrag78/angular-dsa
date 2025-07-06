import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  transition,
  style,
  animate,
  stagger,
  query,
} from '@angular/animations';
@Component({
  selector: 'app-armstrong-number',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './armstrong-number.component.html',
  styleUrl: './armstrong-number.component.scss',
  animations: [
    trigger('staggerIn', [
      transition(':enter', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('100ms', [
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class ArmstrongNumberComponent {
  examples = [
    {
      number: 153,
      digits: [1, 5, 3],
      digitCount: 3
    },
    {
      number: 370,
      digits: [3, 7, 0],
      digitCount: 3
    },
    {
      number: 371,
      digits: [3, 7, 1],
      digitCount: 3
    },
    {
      number: 407,
      digits: [4, 0, 7],
      digitCount: 3
    },
    {
      number: 123,
      digits: [1, 2, 3],
      digitCount: 3
    }
  ];

   selectedExample: any = null;
  userNumber: number | null = null;
  result: boolean | null = null;
  allThreeDigitNumbers: number[] = [];

  ngOnInit() {
    // Initialize with first example
    this.selectedExample = this.examples[0];
    
    // Generate all 3-digit numbers (100-999)
    this.allThreeDigitNumbers = Array.from({length: 900}, (_, i) => i + 100);
  }

  onExampleSelect() {
    this.clearResult();
  }

  getSum(digits: number[], power: number): number {
    return digits.reduce((sum, digit) => sum + Math.pow(digit, power), 0);
  }

  isArmstrong(num: number): boolean {
    const digits = String(num).split('').map(Number);
    const power = digits.length;
    const sum = digits.reduce((total, digit) => total + Math.pow(digit, power), 0);
    return sum === num;
  }

  checkNumber() {
    if (this.userNumber !== null) {
      this.result = this.isArmstrong(this.userNumber);
    }
  }

  clearResult() {
    this.result = null;
  }

  convertToPower(num1: number, num2: number) {
    return Math.pow(num1, num2);
  }
}