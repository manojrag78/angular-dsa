/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  const limit: number = data;
  const primes: number[] = [];

  if (limit < 2) {
    postMessage([]);
    return;
  }

  for (let i = 2; i <= limit; i++) {
    if (checkPrime(i)) primes.push(i);
  }

  postMessage(primes);
});

function checkPrime(n: number): boolean {
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}
