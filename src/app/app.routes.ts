import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/pages/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./modules/home/pages/home.module').then(m => m.HomeModule)
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];
