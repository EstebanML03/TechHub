import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PublicacionesService } from '../../../blog/services/publicaciones.service';
import { GruposService } from '../../../grupos/services/grupos.service';
import { EventosService } from '../../../eventos/services/eventos.service';
import { EmprendimientosService } from '../../../emprendimientos/services/emprendimientos.service';
import { StorageService } from '../../../../shared/services/storage.service';
import { from } from 'rxjs';

interface Stats {
  totalPublicaciones: number;
  misPublicaciones: number;
  totalGrupos: number;
  misGrupos: number;
  totalEventos: number;
  eventosInscritos: number;
  totalEmprendimientos: number;
  misEmprendimientos: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats: Stats = {
    totalPublicaciones: 0,
    misPublicaciones: 0,
    totalGrupos: 0,
    misGrupos: 0,
    totalEventos: 0,
    eventosInscritos: 0,
    totalEmprendimientos: 0,
    misEmprendimientos: 0
  };

  usuarioActual: any = null;
  cargando = true;

  // Datos reales de la API
  eventosProximos: any[] = [];
  publicacionesRecientes: any[] = [];
  gruposDestacados: any[] = [];
  emprendimientosRecientes: any[] = [];

  fechaActual = new Date();

  constructor(
    private publicacionesService: PublicacionesService,
    private gruposService: GruposService,
    private eventosService: EventosService,
    private emprendimientosService: EmprendimientosService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.usuarioActual = this.storageService.getItem('usuario');
    
    if (!this.usuarioActual && localStorage.getItem('token')) {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const rol = localStorage.getItem('rol');
      
      if (userId) {
        this.usuarioActual = {
          id_usuario: parseInt(userId),
          nombre: userName || '',
          correo: userEmail || '',
          id_rol: parseInt(rol || '0')
        };
        this.storageService.setItem('usuario', this.usuarioActual);
      }
    }
    
    this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    this.cargando = true;

    try {
      // Cargar publicaciones
      this.publicacionesService.getPublicaciones().subscribe({
        next: (publicaciones: any[]) => {
          this.stats.totalPublicaciones = publicaciones.length;
          this.stats.misPublicaciones = publicaciones.filter((p: any) => 
            p.id_usuario === this.usuarioActual?.id_usuario
          ).length;

          // Top 3 publicaciones más recientes
          this.publicacionesRecientes = publicaciones
            .sort((a: any, b: any) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
            .slice(0, 3);
        },
        error: () => {}
      });

      // Cargar grupos
      this.gruposService.getGrupos().subscribe({
        next: (grupos) => {
          this.stats.totalGrupos = grupos.length;
          this.stats.misGrupos = grupos.filter(g => 
            g.miembros?.some((m: any) => m.id_usuario === this.usuarioActual?.id_usuario)
          ).length;

          // Top 3 grupos más recientes
          this.gruposDestacados = grupos
            .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
            .slice(0, 3);
        },
        error: () => {}
      });

      // Cargar eventos
      from(this.eventosService.obtenerEventos()).subscribe({
        next: (eventos) => {
          this.stats.totalEventos = eventos.length;
          
          // Filtrar eventos futuros y ordenar por fecha
          const ahora = new Date();
          this.eventosProximos = eventos
            .filter(e => new Date(e.fecha_evento) > ahora)
            .sort((a, b) => new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime())
            .slice(0, 4);
        },
        error: () => {}
      });

      // Cargar eventos inscritos
      from(this.eventosService.obtenerEventosInscritos()).subscribe({
        next: (eventosInscritos) => {
          this.stats.eventosInscritos = eventosInscritos.length;
        },
        error: () => {}
      });

      // Cargar emprendimientos
      from(this.emprendimientosService.obtenerEmprendimientos()).subscribe({
        next: (emprendimientos) => {
          this.stats.totalEmprendimientos = emprendimientos.length;
          this.stats.misEmprendimientos = emprendimientos.filter(e => 
            e.id_usuario === this.usuarioActual?.id_usuario
          ).length;

          // Top 3 emprendimientos más recientes
          this.emprendimientosRecientes = emprendimientos
            .sort((a, b) => new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime())
            .slice(0, 3);
        },
        error: () => {}
      });

    } catch (error) {
      // Error silencioso
    } finally {
      this.cargando = false;
    }
  }

  formatearFecha(fecha: Date | string): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const ahora = new Date();
    const diff = ahora.getTime() - date.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  formatearFechaCompleta(fecha: Date | string): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDiasHastaEvento(fecha: Date | string): number {
    const fechaEvento = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const ahora = new Date();
    const diff = fechaEvento.getTime() - ahora.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getTruncatedText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
  }

  volverHome(): void {
    this.router.navigate(['/home']);
  }
}
