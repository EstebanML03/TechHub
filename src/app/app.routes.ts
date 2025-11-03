import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home' // Redirige a home, el AuthGuard se encargará de redirigir a auth si no está autenticado
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then(m => m.AuthModule),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./modules/home/home-module').then(m => m.HomeModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./modules/settings/settings.module').then(m => m.SettingsModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];
