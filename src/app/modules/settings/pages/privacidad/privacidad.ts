import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../shared/services/alert.service';

interface ConfigPrivacidad {
  perfilPublico: boolean;
  mostrarEmail: boolean;
  mostrarTelefono: boolean;
  mostrarUbicacion: boolean;
  permitirMensajes: 'todos' | 'conexiones' | 'nadie';
  mostrarActividad: boolean;
  mostrarProyectos: boolean;
  indexarPerfil: boolean;
  compartirEstadisticas: boolean;
}

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './privacidad.html',
  styleUrl: './privacidad.css'
})
export class PrivacidadComponent implements OnInit {
  config: ConfigPrivacidad = {
    perfilPublico: true,
    mostrarEmail: false,
    mostrarTelefono: false,
    mostrarUbicacion: true,
    permitirMensajes: 'conexiones',
    mostrarActividad: true,
    mostrarProyectos: true,
    indexarPerfil: true,
    compartirEstadisticas: false
  };

  opcionesMensajes = [
    { valor: 'todos', label: 'Todos los usuarios', icon: 'users' },
    { valor: 'conexiones', label: 'Solo mis conexiones', icon: 'user-check' },
    { valor: 'nadie', label: 'Nadie', icon: 'user-x' }
  ];

  cargando = false;

  constructor(
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  cargarConfiguracion(): void {
    const configGuardada = localStorage.getItem('configPrivacidad');
    if (configGuardada) {
      this.config = JSON.parse(configGuardada);
    }
  }

  async guardarConfiguracion(): Promise<void> {
    if (this.cargando) return;

    this.cargando = true;

    // Simular llamada API
    await new Promise(resolve => setTimeout(resolve, 1000));

    localStorage.setItem('configPrivacidad', JSON.stringify(this.config));

    this.cargando = false;
    this.alertService.success(
      'Configuración guardada',
      'Tu configuración de privacidad ha sido actualizada correctamente'
    );
  }

  async restablecerDefecto(): Promise<void> {
    const result = await this.alertService.confirm(
      '¿Restablecer configuración?',
      'Se restaurarán los valores predeterminados de privacidad.'
    );

    if (result.isConfirmed) {
      this.config = {
        perfilPublico: true,
        mostrarEmail: false,
        mostrarTelefono: false,
        mostrarUbicacion: true,
        permitirMensajes: 'conexiones',
        mostrarActividad: true,
        mostrarProyectos: true,
        indexarPerfil: true,
        compartirEstadisticas: false
      };

      await this.guardarConfiguracion();
    }
  }

  async descargarDatos(): Promise<void> {
    const result = await this.alertService.confirm(
      'Descargar mis datos',
      'Se generará un archivo con toda tu información. ¿Deseas continuar?'
    );

    if (result.isConfirmed) {
      this.cargando = true;

      // Simular generación de archivo
      await new Promise(resolve => setTimeout(resolve, 2000));

      const datos = {
        perfil: {
          nombre: 'Usuario TechHub',
          email: 'usuario@techhub.com',
          fechaRegistro: new Date()
        },
        actividad: 'Datos de actividad...',
        privacidad: this.config
      };

      const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mis-datos-techhub.json';
      a.click();
      window.URL.revokeObjectURL(url);

      this.cargando = false;
      this.alertService.success(
        'Descarga completada',
        'Tus datos han sido descargados correctamente'
      );
    }
  }

  async eliminarCuenta(): Promise<void> {
    const result = await this.alertService.confirm(
      '¿Eliminar cuenta permanentemente?',
      'Esta acción no se puede deshacer. Perderás todos tus datos, publicaciones y conexiones.',
      'Eliminar'
    );

    if (result.isConfirmed) {
      const confirmacion = await this.alertService.confirm(
        '¿Estás completamente seguro?',
        'Escribe "ELIMINAR" para confirmar esta acción irreversible.',
        'Confirmar eliminación'
      );

      if (confirmacion.isConfirmed) {
        this.cargando = true;

        // Simular eliminación
        await new Promise(resolve => setTimeout(resolve, 2000));

        this.cargando = false;
        this.alertService.success(
          'Cuenta eliminada',
          'Tu cuenta ha sido eliminada. Serás redirigido al inicio.'
        );

        setTimeout(() => {
          this.router.navigate(['/auth']);
        }, 2000);
      }
    }
  }

  volver(): void {
    this.router.navigate(['/settings']);
  }
}
