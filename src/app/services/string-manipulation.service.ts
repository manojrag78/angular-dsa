import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StringManipulationService {

  reverseString(input: string): string {
    return input.split('').reverse().join('');
  }

  isPalindrome(input: string): string {
    const cleaned = input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return cleaned === cleaned.split('').reverse().join('') ? 
      'Yes, it is a palindrome' : 'No, it is not a palindrome';
  }

  countVowels(input: string): string {
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
    const count = input.toLowerCase().split('')
      .filter(c => vowels.has(c)).length;
    return `Vowel count: ${count}`;
  }

  firstNonRepeatingChar(input: string): string {
    const charCount = new Map<string, number>();
    for (const char of input) {
      charCount.set(char, (charCount.get(char) || 0) + 1);
    }
    for (const char of input) {
      if (charCount.get(char) === 1) return `First non-repeating: '${char}'`;
    }
    return 'All characters repeat';
  }

  compressString(input: string): string {
    let compressed = '';
    let count = 1;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === input[i+1]) {
        count++;
      } else {
        compressed += input[i] + (count > 1 ? count : '');
        count = 1;
      }
    }
    return compressed.length < input.length ? 
      `Compressed: ${compressed}` : `No compression needed: ${input}`;
  }

  longestSubstringWithoutRepeating(input: string): string {
    let max = 0;
    let start = 0;
    const charMap = new Map<string, number>();
    let maxSubstring = '';
    
    for (let end = 0; end < input.length; end++) {
      const char = input[end];
      if (charMap.has(char)) {
        start = Math.max(start, charMap.get(char)! + 1);
      }
      charMap.set(char, end);
      if (end - start + 1 > max) {
        max = end - start + 1;
        maxSubstring = input.substring(start, end + 1);
      }
    }
    
    return maxSubstring ? `Longest substring: "${maxSubstring}" (length: ${max})` : 'Empty string';
  }

  atoi(input: string): string {
    input = input.trim();
    if (!input) return '0';
    
    let sign = 1;
    let i = 0;
    let result = 0;
    
    if (input[i] === '+' || input[i] === '-') {
      sign = input[i] === '-' ? -1 : 1;
      i++;
    }
    
    while (i < input.length && /^\d$/.test(input[i])) {
      const digit = parseInt(input[i]);
      result = result * 10 + digit;
      
      if (sign === 1 && result > Math.pow(2, 31) - 1) {
        return `Result: ${Math.pow(2, 31) - 1} (clamped to max)`;
      }
      if (sign === -1 && result > Math.pow(2, 31)) {
        return `Result: ${-Math.pow(2, 31)} (clamped to min)`;
      }
      
      i++;
    }
    
    return `Result: ${sign * result}`;
  }

  validParentheses(input: string): string {
    const stack: string[] = [];
    const pairs: Record<string, string> = {
      ')': '(',
      '}': '{',
      ']': '['
    };
    
    for (const char of input) {
      if (pairs[char]) {
        if (stack.pop() !== pairs[char]) {
          return 'Invalid parentheses';
        }
      } else {
        stack.push(char);
      }
    }
    
    return stack.length === 0 ? 'Valid parentheses' : 'Invalid parentheses';
  }
}