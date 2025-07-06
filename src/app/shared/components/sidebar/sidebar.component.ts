import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  mobileMenuOpen = false;
  darkMode = false;

  navSections = [
    {
      name: 'JavaScript',
      items: [
        { name: 'Armstrong Numbers', path: 'learning/armstrong-number', icon: 'calculator' },
        { name: 'Prime Numbers', path: 'learning/prime-numbers', icon: 'view-list' },
        { name: 'String Manipulation', path: 'learning/string-manipulation', icon: 'code' },
        { name : 'Sorting Algorithms', path: 'learning/sorting-algorithms', icon: 'code' },
        { name: 'Fibonacci Sequence', path: 'learning/fibonacci', icon: 'calculator' },
        { name: 'Factorial Calculation', path: 'learning/factorial', icon: 'calculator' },
        { name: 'DP Algorithms', path: 'learning/dp-visualizer', icon: 'code' },
        { name : 'Heap Sort', path: 'learning/heap-visualizer', icon: 'code' },
        { name: 'Binary Search', path: 'learning/bst-visualizer', icon: 'code' },
        { name : 'Graph Algorithms', path: 'learning/graph-visualizer', icon: 'code' },
        { name : 'Stack and Queue', path: 'learning/stack-queue-visualizer', icon: 'code' },
        { name: 'Linked List', path: 'learning/linked-list', icon: 'code' },
        { name: 'Backtracking Algorithms', path: 'learning/backtracking-visualizer', icon: 'code' },
        { name : 'Sudoku Solver', path: 'learning/sudoku-solver', icon: 'code' },
      ]
    },
    {
      name: 'Node.js',
      items: [
        { name: 'Node.js Server Steps', path: 'learning/nodejs-server-steps', icon: 'server' },
        { name: 'Express Routes', path: 'learning/express-routes', icon: 'lightning-bolt' }
      ]
    },
    {
      name: 'DevOps',
      items: [
        { name: 'NGINX Commands', path: '/nginx', icon: 'chip' },
        { name: 'Docker Commands', path: '/docker', icon: 'cube' }
      ]
    }
  ];

  constructor(public router: Router) {}

  ngOnInit() {
    // Check for saved theme preference
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    this.applyTheme();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    this.applyTheme();
  }

  private applyTheme() {
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  getIconPath(iconName: string): string {
    const icons: {[key: string]: string} = {
      'calculator': 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      'view-list': 'M4 6h16M4 10h16M4 14h16M4 18h16',
      'code': 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      'server': 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
      'lightning-bolt': 'M13 10V3L4 14h7v7l9-11h-7z',
      'chip': 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
      'cube': 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
    };
    return icons[iconName] || '';
  }
}