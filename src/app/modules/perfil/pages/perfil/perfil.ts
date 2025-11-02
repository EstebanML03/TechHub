import { Component, OnInit } from '@angular/core';
import { Perfil as PerfilModel } from '../../models/perfil.model';
import { AlertService } from '../../../../shared/services/alert.service';

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
  perfil: PerfilModel = {
    nombre: 'Juan Pérez',
    email: 'juan.perez@techhub.com',
    avatar: '',
    bio: 'Desarrollador Full Stack apasionado por crear soluciones innovadoras. Me encanta aprender nuevas tecnologías y compartir conocimiento con la comunidad.',
    rol: 'Senior Full Stack Developer',
    ubicacion: 'Madrid, España',
    empresa: 'TechHub Solutions',
    website: 'https://juanperez.dev',
    github: 'github.com/juanperez',
    linkedin: 'linkedin.com/in/juanperez',
    skills: ['JavaScript', 'TypeScript', 'Angular', 'React', 'Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
    intereses: ['Inteligencia Artificial', 'Cloud Computing', 'Open Source', 'DevOps', 'Machine Learning', 'Blockchain']
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
  perfilEditado: PerfilModel = { ...this.perfil };
  avatarPreview: string = '';
  iniciales: string = 'JP';

  constructor(private alertService: AlertService) {
    this.calcularIniciales();
  }

  ngOnInit(): void {}

  calcularIniciales(): void {
    const nombres = this.perfil.nombre.split(' ');
    this.iniciales = nombres.map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
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

    this.perfil = { ...this.perfilEditado };
    this.editando = false;
    this.calcularIniciales();

    await this.alertService.success('¡Perfil actualizado!', 'Tus cambios se han guardado exitosamente');
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.perfilEditado = { ...this.perfil };
    this.avatarPreview = '';
  }

  validarPerfil(): boolean {
    return !!(this.perfilEditado.nombre && this.perfilEditado.email && this.perfilEditado.bio);
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
        this.perfilEditado.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarAvatar(): void {
    this.perfilEditado.avatar = '';
    this.avatarPreview = '';
  }

  agregarSkill(event: any): void {
    const input = event.target.value.trim();
    if (input && event.key === 'Enter') {
      event.preventDefault();
      if (!this.perfilEditado.skills.includes(input)) {
        this.perfilEditado.skills.push(input);
        event.target.value = '';
      } else {
        this.alertService.warning('Skill duplicado', 'Esta habilidad ya está en tu perfil');
      }
    }
  }

  eliminarSkill(index: number): void {
    this.perfilEditado.skills.splice(index, 1);
  }

  agregarInteres(event: any): void {
    const input = event.target.value.trim();
    if (input && event.key === 'Enter') {
      event.preventDefault();
      if (!this.perfilEditado.intereses.includes(input)) {
        this.perfilEditado.intereses.push(input);
        event.target.value = '';
      } else {
        this.alertService.warning('Interés duplicado', 'Este interés ya está en tu perfil');
      }
    }
  }

  eliminarInteres(index: number): void {
    this.perfilEditado.intereses.splice(index, 1);
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
