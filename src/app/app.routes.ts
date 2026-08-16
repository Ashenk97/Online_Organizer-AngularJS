import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((module) => module.Home),
  },
  {
    path: 'completed',
    loadComponent: () => import('./features/completed/completed').then((module) => module.Completed),
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile').then((module) => module.Profile),
  },
  { path: '**', redirectTo: '' },
];
