import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

interface OpcionSettings {
  titulo: string;
  descripcion: string;
  icon: string;
  ruta: string;
  color: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent {
  opciones: OpcionSettings[] = [
    {
      titulo: 'Notificaciones',
      descripcion: 'Gestiona tus preferencias de notificaciones',
      icon: 'bell',
      ruta: '/settings/notificaciones',
      color: 'primary'
    },
    {
      titulo: 'Privacidad',
      descripcion: 'Controla quién puede ver tu información',
      icon: 'shield',
      ruta: '/settings/privacidad',
      color: 'success'
    },
    {
      titulo: 'Cambiar Contraseña',
      descripcion: 'Actualiza tu contraseña de acceso',
      icon: 'lock',
      ruta: '/settings/password',
      color: 'warning'
    },
    {
      titulo: 'Tema',
      descripcion: 'Personaliza la apariencia de la aplicación',
      icon: 'palette',
      ruta: '/settings/tema',
      color: 'info'
    }
  ];

  constructor(private router: Router) {}

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
