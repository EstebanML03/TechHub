import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/settings/settings').then(m => m.SettingsComponent)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil').then(m => m.Perfil)
  },
  {
    path: 'notificaciones',
    loadComponent: () => import('./pages/notificaciones/notificaciones').then(m => m.NotificacionesComponent)
  },
  {
    path: 'privacidad',
    loadComponent: () => import('./pages/privacidad/privacidad').then(m => m.PrivacidadComponent)
  },
  {
    path: 'password',
    loadComponent: () => import('./pages/password/password').then(m => m.PasswordComponent)
  },
  {
    path: 'tema',
    loadComponent: () => import('./pages/tema/tema').then(m => m.TemaComponent)
  },
  {
    path: 'terminos',
    loadComponent: () => import('./pages/terminos/terminos').then(m => m.TerminosComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
