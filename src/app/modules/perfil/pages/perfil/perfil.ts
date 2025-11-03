import { Component, OnInit } from '@angular/core';
import { UsuarioPerfil } from '../../models/perfil.model';
import { AlertService } from '../../../../shared/services/alert.service';
import { PerfilService } from '../../services/perfil.service';

interface Estadistica {
  label: string;
  valor: number;
  icon: string;
  color: string;
}

interface ActividadReciente {
  tipo: 'evento' | 'post' | 'emprendimiento' | 'comentario';
  titulo: string;
  fecha: Date;
  icon: string;
}

@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  perfil: UsuarioPerfil = {
    nombre: '',
    apellido: '',
    cedula: '',
    correo: '',
    id_rol: 2 // Usuario por defecto
  };

  estadisticas: Estadistica[] = [
    { label: 'Eventos asistidos', valor: 12, icon: 'calendar', color: 'primary' },
    { label: 'Posts publicados', valor: 24, icon: 'file-text', color: 'success' },
    { label: 'Conexiones', valor: 156, icon: 'users', color: 'info' },
    { label: 'Proyectos', valor: 8, icon: 'lightbulb', color: 'warning' }
  ];

  actividadesRecientes: ActividadReciente[] = [
    { tipo: 'evento', titulo: 'Participó en "Angular Workshop 2024"', fecha: new Date(2024, 9, 28), icon: 'calendar' },
    { tipo: 'post', titulo: 'Publicó "Introducción a Signals en Angular"', fecha: new Date(2024, 9, 25), icon: 'file-text' },
    { tipo: 'emprendimiento', titulo: 'Creó proyecto "TaskHub - Gestión de Tareas"', fecha: new Date(2024, 9, 20), icon: 'lightbulb' },
    { tipo: 'comentario', titulo: 'Comentó en "Mejores prácticas de TypeScript"', fecha: new Date(2024, 9, 18), icon: 'message-circle' }
  ];

  editando: boolean = false;
  perfilEditado: UsuarioPerfil = { ...this.perfil };
  avatarPreview: string = '';
  iniciales: string = 'U';
  cargando: boolean = false;

  constructor(
    private alertService: AlertService,
    private perfilService: PerfilService
  ) {
    this.calcularIniciales();
  }

  async ngOnInit(): Promise<void> {
    await this.cargarPerfil();
  }

  async cargarPerfil(): Promise<void> {
    this.cargando = true;
    try {
      this.perfil = await this.perfilService.obtenerPerfil();
      this.perfilEditado = { ...this.perfil };
      this.calcularIniciales();
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      await this.alertService.error('Error', 'No se pudo cargar el perfil');
    } finally {
      this.cargando = false;
    }
  }

  calcularIniciales(): void {
    if (!this.perfil.nombre) {
      this.iniciales = 'U';
      return;
    }
    const nombres = this.perfil.nombre.split(' ');
    this.iniciales = nombres.map((n: string) => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  activarEdicion(): void {
    this.editando = true;
    this.perfilEditado = { ...this.perfil };
  }

  async guardarCambios(): Promise<void> {
    if (!this.validarPerfil()) {
      this.alertService.warning('Datos incompletos', 'Por favor completa los campos obligatorios');
      return;
    }

    this.cargando = true;
    try {
      // Preparar los datos para enviar a la API
      const datosActualizados = {
        nombre: this.perfilEditado.nombre,
        apellido: this.perfilEditado.apellido,
        telefono: this.perfilEditado.telefono,
        carrera: this.perfilEditado.carrera
      };

      // Verificar que tenemos el ID del usuario
      if (!this.perfil.id_usuario) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      // Actualizar el perfil en la API
      await this.perfilService.actualizarPerfil(this.perfil.id_usuario, datosActualizados);
      
      // Actualizar los datos locales
      this.perfil = { ...this.perfilEditado };
      this.editando = false;
      this.calcularIniciales();

      await this.alertService.success('¡Perfil actualizado!', 'Tus cambios se han guardado exitosamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      await this.alertService.error('Error', 'No se pudo actualizar el perfil');
    } finally {
      this.cargando = false;
    }
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.perfilEditado = { ...this.perfil };
    this.avatarPreview = '';
  }

  validarPerfil(): boolean {
    return !!(this.perfilEditado.nombre && this.perfilEditado.correo);
  }

  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.alertService.error('Archivo muy grande', 'El avatar no puede ser mayor a 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarAvatar(): void {
    this.avatarPreview = '';
  }

  getActividadIcon(tipo: string): string {
    const iconos: Record<string, string> = {
      'evento': 'calendar',
      'post': 'file-text',
      'emprendimiento': 'lightbulb',
      'comentario': 'message-circle'
    };
    return iconos[tipo] || 'circle';
  }

  getEstadisticaClass(color: string): string {
    return `stat-card-${color}`;
  }

  formatearFecha(fecha: Date): string {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    return `Hace ${Math.floor(dias / 30)} meses`;
  }
}
