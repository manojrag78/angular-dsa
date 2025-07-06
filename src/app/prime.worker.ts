/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  const primes: number[] = [];
  for (let i = 2; i <= data; i++) {
    if (isPrime(i)) primes.push(i);
  }

  postMessage(primes);
});

function isPrime(n: number): boolean {
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}