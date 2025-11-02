import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../shared/services/alert.service';

interface PreferenciaNotificacion {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'email' | 'push' | 'sms';
  categorias: {
    eventos: boolean;
    mensajes: boolean;
    comentarios: boolean;
    seguidores: boolean;
    blog: boolean;
    emprendimientos: boolean;
  };
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css'
})
export class NotificacionesComponent implements OnInit {
  preferencias: PreferenciaNotificacion[] = [
    {
      id: 'email',
      titulo: 'Notificaciones por Email',
      descripcion: 'Recibe actualizaciones en tu correo electrónico',
      tipo: 'email',
      categorias: {
        eventos: true,
        mensajes: true,
        comentarios: true,
        seguidores: false,
        blog: true,
        emprendimientos: false
      }
    },
    {
      id: 'push',
      titulo: 'Notificaciones Push',
      descripcion: 'Recibe notificaciones instantáneas en tu dispositivo',
      tipo: 'push',
      categorias: {
        eventos: true,
        mensajes: true,
        comentarios: true,
        seguidores: true,
        blog: false,
        emprendimientos: true
      }
    },
    {
      id: 'sms',
      titulo: 'Notificaciones por SMS',
      descripcion: 'Recibe mensajes de texto importantes',
      tipo: 'sms',
      categorias: {
        eventos: false,
        mensajes: false,
        comentarios: false,
        seguidores: false,
        blog: false,
        emprendimientos: false
      }
    }
  ];

  categorias = [
    { key: 'eventos', label: 'Eventos', icon: 'calendar', descripcion: 'Nuevos eventos y recordatorios' },
    { key: 'mensajes', label: 'Mensajes', icon: 'message-circle', descripcion: 'Mensajes directos y respuestas' },
    { key: 'comentarios', label: 'Comentarios', icon: 'message-square', descripcion: 'Comentarios en tus publicaciones' },
    { key: 'seguidores', label: 'Seguidores', icon: 'users', descripcion: 'Nuevos seguidores y conexiones' },
    { key: 'blog', label: 'Blog', icon: 'file-text', descripcion: 'Nuevas entradas de blog' },
    { key: 'emprendimientos', label: 'Emprendimientos', icon: 'lightbulb', descripcion: 'Actualizaciones de proyectos' }
  ];

  notificacionesGlobales = true;
  sonidos = true;
  noMolestar = false;
  horarioNoMolestar = {
    inicio: '22:00',
    fin: '08:00'
  };

  cargando = false;

  constructor(
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.cargarPreferencias();
  }

  cargarPreferencias(): void {
    // Simular carga desde localStorage o API
    const preferenciasGuardadas = localStorage.getItem('preferenciasNotificaciones');
    if (preferenciasGuardadas) {
      const datos = JSON.parse(preferenciasGuardadas);
      this.preferencias = datos.preferencias || this.preferencias;
      this.notificacionesGlobales = datos.notificacionesGlobales ?? true;
      this.sonidos = datos.sonidos ?? true;
      this.noMolestar = datos.noMolestar ?? false;
      this.horarioNoMolestar = datos.horarioNoMolestar || this.horarioNoMolestar;
    }
  }

  toggleCategoria(tipoNotificacion: PreferenciaNotificacion, categoriaKey: string): void {
    const categoria = categoriaKey as keyof typeof tipoNotificacion.categorias;
    tipoNotificacion.categorias[categoria] = !tipoNotificacion.categorias[categoria];
  }

  toggleTodo(tipoNotificacion: PreferenciaNotificacion, valor: boolean): void {
    Object.keys(tipoNotificacion.categorias).forEach(key => {
      const categoria = key as keyof typeof tipoNotificacion.categorias;
      tipoNotificacion.categorias[categoria] = valor;
    });
  }

  algunaCategoriaActiva(tipoNotificacion: PreferenciaNotificacion): boolean {
    return Object.values(tipoNotificacion.categorias).some(valor => valor);
  }

  todasCategoriasActivas(tipoNotificacion: PreferenciaNotificacion): boolean {
    return Object.values(tipoNotificacion.categorias).every(valor => valor);
  }

  getCategoriaActiva(preferencia: PreferenciaNotificacion, categoriaKey: string): boolean {
    const categoria = categoriaKey as keyof typeof preferencia.categorias;
    return preferencia.categorias[categoria];
  }

  async guardarPreferencias(): Promise<void> {
    if (this.cargando) return;

    this.cargando = true;

    // Simular llamada API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const datos = {
      preferencias: this.preferencias,
      notificacionesGlobales: this.notificacionesGlobales,
      sonidos: this.sonidos,
      noMolestar: this.noMolestar,
      horarioNoMolestar: this.horarioNoMolestar
    };

    localStorage.setItem('preferenciasNotificaciones', JSON.stringify(datos));

    this.cargando = false;
    this.alertService.success(
      'Preferencias guardadas',
      'Tus preferencias de notificaciones han sido actualizadas correctamente'
    );
  }

  async restablecerDefecto(): Promise<void> {
    const result = await this.alertService.confirm(
      '¿Restablecer preferencias?',
      'Se restaurarán los valores predeterminados. Esta acción no se puede deshacer.'
    );

    if (result.isConfirmed) {
      this.notificacionesGlobales = true;
      this.sonidos = true;
      this.noMolestar = false;
      this.horarioNoMolestar = { inicio: '22:00', fin: '08:00' };

      this.preferencias = [
        {
          id: 'email',
          titulo: 'Notificaciones por Email',
          descripcion: 'Recibe actualizaciones en tu correo electrónico',
          tipo: 'email',
          categorias: {
            eventos: true,
            mensajes: true,
            comentarios: true,
            seguidores: false,
            blog: true,
            emprendimientos: false
          }
        },
        {
          id: 'push',
          titulo: 'Notificaciones Push',
          descripcion: 'Recibe notificaciones instantáneas en tu dispositivo',
          tipo: 'push',
          categorias: {
            eventos: true,
            mensajes: true,
            comentarios: true,
            seguidores: true,
            blog: false,
            emprendimientos: true
          }
        },
        {
          id: 'sms',
          titulo: 'Notificaciones por SMS',
          descripcion: 'Recibe mensajes de texto importantes',
          tipo: 'sms',
          categorias: {
            eventos: false,
            mensajes: false,
            comentarios: false,
            seguidores: false,
            blog: false,
            emprendimientos: false
          }
        }
      ];

      await this.guardarPreferencias();
    }
  }

  volver(): void {
    this.router.navigate(['/settings']);
  }

  getIconoTipo(tipo: string): string {
    const iconos: { [key: string]: string } = {
      email: 'mail',
      push: 'bell',
      sms: 'smartphone'
    };
    return iconos[tipo] || 'bell';
  }
}
