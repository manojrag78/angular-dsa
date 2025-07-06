import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prime-numbers',
  standalone: true,
  imports: [CommonModule , FormsModule],
  templateUrl: './prime-numbers.component.html',
  styleUrl: './prime-numbers.component.scss'
})
export class PrimeNumbersComponent {

  primes: number[] = [];
  isWorking = false;
  limit: number = 100; // default limit
  runWorker(limit: number) {
    if (typeof Worker !== 'undefined') {
      this.primes = []; // reset primes
      this.isWorking = true;
      const worker = new Worker(new URL('./prime.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
        this.primes = data;
        this.isWorking = false;
      };
      worker.postMessage(limit);  // send upper limit
    } else {
      console.error('Web Workers are not supported in this environment.');
    }
  }
}
