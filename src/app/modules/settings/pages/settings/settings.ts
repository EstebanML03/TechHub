import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../shared/services/alert.service';

interface OpcionSettings {
  titulo: string;
  descripcion: string;
  icon: string;
  ruta: string;
  color: string;
  disponible: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {
  opciones: OpcionSettings[] = [
    {
      titulo: 'Mi Perfil',
      descripcion: 'Ver y editar tu información personal',
      icon: 'user',
      ruta: '/settings/perfil',
      color: 'primary',
      disponible: true
    },
    {
      titulo: 'Notificaciones',
      descripcion: 'Gestiona tus preferencias de notificaciones',
      icon: 'bell',
      ruta: '/settings/notificaciones',
      color: 'primary',
      disponible: true
    },
    {
      titulo: 'Privacidad',
      descripcion: 'Controla quién puede ver tu información',
      icon: 'shield',
      ruta: '/settings/privacidad',
      color: 'success',
      disponible: true
    },
    {
      titulo: 'Cambiar Contraseña',
      descripcion: 'Actualiza tu contraseña de acceso',
      icon: 'lock',
      ruta: '/settings/password',
      color: 'warning',
      disponible: true
    },
    {
      titulo: 'Tema',
      descripcion: 'Personaliza la apariencia de la aplicación',
      icon: 'palette',
      ruta: '/settings/tema',
      color: 'info',
      disponible: true
    },
    {
      titulo: 'Términos y Condiciones',
      descripcion: 'Lee nuestros términos de servicio y políticas',
      icon: 'file-text',
      ruta: '/settings/terminos',
      color: 'secondary',
      disponible: true
    },
    {
      titulo: 'Manual de Usuario',
      descripcion: 'Aprende a usar TechHub con nuestra guía completa',
      icon: 'book-open',
      ruta: 'https://wiry-flyingfish-e9a.notion.site/Manual-de-usuario-de-TechHub-f20d8c54b8d44d6a9dc9450ee85e3d30',
      color: 'info',
      disponible: true
    }
  ];

  constructor(
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Mostrar popup informativo solo la primera vez
    this.mostrarInfoDesarrollo();
  }

  async mostrarInfoDesarrollo(): Promise<void> {
    // Verificar si el popup ya se mostró antes
    const popupMostrado = localStorage.getItem('settingsInfoMostrado');
    
    // Si ya se mostró, no volver a mostrarlo
    if (popupMostrado === 'true') {
      return;
    }

    // Mostrar el popup

    await this.alertService.info(
      '🎨 Estado de los Módulos',
      `
        <div style="text-align: left;">
          <p style="margin-bottom: 12px;"><strong>Módulos Completos y Funcionales:</strong></p>
          <ul style="margin: 0 0 16px 20px; padding: 0;">
            <li style="margin-bottom: 8px;">✅ <strong>Mi Perfil</strong> - Ver y editar tu información</li>
            <li style="margin-bottom: 8px;">✅ <strong>Cambiar Contraseña</strong> - Actualizar contraseña de acceso</li>
            <li style="margin-bottom: 8px;">✅ <strong>Términos y Condiciones</strong> - Políticas completas</li>
            <li style="margin-bottom: 8px;">📖 <strong>Manual de Usuario</strong> - Guía completa (Notion)</li>
          </ul>
          
          <p style="margin-bottom: 12px;"><strong>En Construcción (Puedes explorarlos):</strong></p>
          <ul style="margin: 0 0 16px 20px; padding: 0;">
            <li style="margin-bottom: 8px;">🔧 <strong>Notificaciones</strong> - Vista en desarrollo</li>
            <li style="margin-bottom: 8px;">🔧 <strong>Privacidad</strong> - Vista en desarrollo</li>
            <li style="margin-bottom: 8px;">🔧 <strong>Tema</strong> - Vista en desarrollo</li>
          </ul>
          
          <p style="margin-top: 16px; color: #6b7280; font-size: 14px;">
            <em>Puedes navegar por todos los módulos para ver el progreso del diseño.</em>
          </p>
        </div>
      `,
      true  // Indicar que es contenido HTML
    );

    // Marcar como mostrado en localStorage
    localStorage.setItem('settingsInfoMostrado', 'true');
  }

  navegarA(opcion: OpcionSettings): void {
    // Si es una URL externa (comienza con http o https), abrir en nueva pestaña
    if (opcion.ruta.startsWith('http://') || opcion.ruta.startsWith('https://')) {
      window.open(opcion.ruta, '_blank', 'noopener,noreferrer');
    } else {
      // Navegación interna
      this.router.navigate([opcion.ruta]);
    }
  }

  volverHome(): void {
    this.router.navigate(['/home']);
  }

  // Método para resetear el popup (útil para desarrollo o testing)
  resetearPopupInfo(): void {
    localStorage.removeItem('settingsInfoMostrado');
    console.log('✅ Popup de información reseteado. Se mostrará en la próxima visita.');
  }
}
