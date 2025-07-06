import { Routes } from '@angular/router';

export const routes: Routes = [
     { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
     { path: 'learning', loadChildren: () => import('./core/learning/learning.module').then(m => m.LearningModule) },
     { path: 'auth', loadChildren: () => import('./core/auth/auth.module').then(m => m.AuthModule) }
];
