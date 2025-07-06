import { Component } from '@angular/core';
import { StringManipulationService } from '../../../../services/string-manipulation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
interface Problem {
  id: string;
  name: string;
  description: string;
  inputLabel: string;
  inputType: string;
}
@Component({
  selector: 'app-string-manipulation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './string-manipulation.component.html',
  styleUrl: './string-manipulation.component.scss'
})
export class StringManipulationComponent {

 problems: Problem[] = [
    { 
      id: 'reverse',
      name: 'Reverse String',
      description: 'Enter a string to reverse it',
      inputLabel: 'Enter a string',
      inputType: 'text'
    },
    {
      id: 'palindrome',
      name: 'Palindrome Check',
      description: 'Check if a string reads the same forwards and backwards',
      inputLabel: 'Enter a string to check',
      inputType: 'text'
    },
    {
      id: 'vowels',
      name: 'Count Vowels',
      description: 'Count the number of vowels in a string',
      inputLabel: 'Enter a string',
      inputType: 'text'
    },
    {
      id: 'non-repeating',
      name: 'First Non-Repeating Character',
      description: 'Find the first character that doesn\'t repeat',
      inputLabel: 'Enter a string',
      inputType: 'text'
    },
    {
      id: 'compression',
      name: 'String Compression',
      description: 'Compress repeated characters with counts',
      inputLabel: 'Enter a string (e.g., aabcccccaaa)',
      inputType: 'text'
    },
    {
      id: 'longest-substring',
      name: 'Longest Substring Without Repeating',
      description: 'Find the longest substring with unique characters',
      inputLabel: 'Enter a string',
      inputType: 'text'
    },
    {
      id: 'atoi',
      name: 'String to Integer (atoi)',
      description: 'Convert a string to a 32-bit signed integer',
      inputLabel: 'Enter a numeric string',
      inputType: 'text'
    },
    {
      id: 'parentheses',
      name: 'Valid Parentheses',
      description: 'Check if parentheses are properly closed',
      inputLabel: 'Enter parentheses only (e.g., "{[()]}")',
      inputType: 'text'
    }
  ];

  activeProblem = this.problems[0];
  userInput = '';
  result = '';
  error = '';

  constructor(private stringService: StringManipulationService) {}

  setActiveProblem(problem: Problem) {
    this.activeProblem = problem;
    this.userInput = '';
    this.result = '';
    this.error = '';
  }

  solveProblem() {
    this.error = '';
    this.result = '';
    
    if (!this.userInput && this.activeProblem.inputType !== 'number') {
      this.error = 'Please enter some input';
      return;
    }

    try {
      switch(this.activeProblem.id) {
        case 'reverse':
          this.result = this.stringService.reverseString(this.userInput);
          break;
        case 'palindrome':
          this.result = this.stringService.isPalindrome(this.userInput);
          break;
        case 'vowels':
          this.result = this.stringService.countVowels(this.userInput);
          break;
        case 'non-repeating':
          this.result = this.stringService.firstNonRepeatingChar(this.userInput);
          break;
        case 'compression':
          this.result = this.stringService.compressString(this.userInput);
          break;
        case 'longest-substring':
          this.result = this.stringService.longestSubstringWithoutRepeating(this.userInput);
          break;
        case 'atoi':
          this.result = this.stringService.atoi(this.userInput);
          break;
        case 'parentheses':
          this.result = this.stringService.validParentheses(this.userInput);
          break;
        default:
          this.error = 'Problem solution not implemented';
      }
    } catch (e) {
      this.error = 'An error occurred while solving the problem';
      console.error(e);
    }
  }

  getSolutionCode(): string {
    switch(this.activeProblem.id) {
      case 'reverse':
        return `function reverseString(input: string): string {\n  return input.split('').reverse().join('');\n}`;
      case 'palindrome':
        return `function isPalindrome(input: string): boolean {\n  const cleaned = input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();\n  return cleaned === cleaned.split('').reverse().join('');\n}`;
      // Add cases for other problems
      default:
        return '// Solution code not available';
    }
  }
}
