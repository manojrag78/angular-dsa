import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrimeNumbersComponent } from './components/prime-numbers/prime-numbers.component';

const routes: Routes = [
  {
    path: 'prime-numbers',
    component: PrimeNumbersComponent
  },
  {
    path: 'sorting-algorithms',
    loadComponent: () => import('./components/sorting-algorithms/sorting-algorithms.component').then(m => m.SortingAlgorithmsComponent)
  },
  {
    path : 'linked-list',
    loadComponent: () => import('./components/linked-list-visualizer/linked-list-visualizer.component').then(m => m.LinkedListVisualizerComponent)
  },
  {
    path: 'stack-queue-visualizer',
    loadComponent: () => import('./components/stack-queue-visualizer/stack-queue-visualizer.component').then(m => m.StackQueueVisualizerComponent)
  },
  {
    path: 'graph-visualizer',
    loadComponent: () => import('./components/graph-visualizer/graph-visualizer.component').then(m => m.GraphVisualizerComponent)
  },
  {
    path: 'bst-visualizer',
    loadComponent: () => import('./components/bst-visualizer/bst-visualizer.component').then(m => m.BstVisualizerComponent)
  },
  {
    path: 'heap-visualizer',
    loadComponent: () => import('./components/heap-visualizer/heap-visualizer.component').then(m => m.HeapVisualizerComponent)
  },
    {
    path: 'dp-visualizer',
    loadComponent: () => import('./components/dp-visualizer/dp-visualizer.component').then(m => m.DpVisualizerComponent)
  },
  {
    path: 'fibonacci',
    loadComponent: () => import('./components/fibonacci/fibonacci.component').then(m => m.FibonacciComponent)
  },
  {
    path: 'backtracking-visualizer',
    loadComponent: () => import('./components/backtracking-visualizer/backtracking-visualizer.component').then(m => m.BacktrackingVisualizerComponent)
  },
  {
    path: 'factorial',
    loadComponent: () => import('./components/factorial/factorial.component').then(m => m.FactorialComponent)
  },
  {
    path:'nodejs-server-steps',
    loadComponent: () => import('./components/nodejs-server-steps/nodejs-server-steps.component').then(m => m.NodejsServerStepsComponent)
  },
  {
    path: 'armstrong-number',
    loadComponent: () => import('./components/armstrong-number/armstrong-number.component').then(m => m.ArmstrongNumberComponent)
  },
  {
    path: 'string-manipulation',
    loadComponent: () => import('./components/string-manipulation/string-manipulation.component').then(m => m.StringManipulationComponent)
  },
  {
    path:'sudoku-solver',
    loadComponent: () => import('./components/sudoku-solver/sudoku-solver.component').then(m => m.SudokuSolverComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LearningRoutingModule { }
