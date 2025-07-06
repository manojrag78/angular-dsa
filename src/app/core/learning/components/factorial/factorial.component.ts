import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-factorial',
  standalone: true,
  imports: [CommonModule , FormsModule],
  templateUrl: './factorial.component.html',
  styleUrls: ['./factorial.component.scss']
})
export class FactorialComponent {
 number = 10;
  result: string = '';

  calculateFactorial(n: number) {
    let res = BigInt(1);
    for (let i = 2; i <= n; i++) {
      res *= BigInt(i);
    }
    this.result = res.toString();
  }
}
