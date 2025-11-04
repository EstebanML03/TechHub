import { Component, OnInit } from '@angular/core';
import { ComunidadService } from '../../services/comunidad.service';
import { Miembro } from '../../models/comunidad.model';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-comunidad',
  standalone: false,
  templateUrl: './comunidad.html',
  styleUrl: './comunidad.css',
})
export class Comunidad implements OnInit {
  miembros: Miembro[] = [];
  miembrosFiltrados: Miembro[] = [];
  cargando: boolean = false;
  
  // Filtros
  busqueda: string = '';
  carreraSeleccionada: string = '';
  carreras: string[] = [];

  constructor(
    private comunidadService: ComunidadService,
    private alertService: AlertService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarMiembros();
  }

  async cargarMiembros(): Promise<void> {
    this.cargando = true;
    try {
      this.miembros = await this.comunidadService.obtenerMiembros();
      this.miembrosFiltrados = [...this.miembros];
      this.extraerCarreras();
    } catch (error) {
      await this.alertService.error('Error', 'No se pudieron cargar los miembros de la comunidad');
    } finally {
      this.cargando = false;
    }
  }

  extraerCarreras(): void {
    const carrerasUnicas = new Set<string>();
    this.miembros.forEach(miembro => {
      if (miembro.carrera) {
        carrerasUnicas.add(miembro.carrera);
      }
    });
    this.carreras = Array.from(carrerasUnicas).sort();
  }

  aplicarFiltros(): void {
    console.log('🔧 Aplicando filtros - Búsqueda:', this.busqueda, 'Carrera:', this.carreraSeleccionada);
    
    this.miembrosFiltrados = this.miembros.filter(miembro => {
      // Filtro de búsqueda (nombre, apellido o correo)
      const busquedaLower = this.busqueda.toLowerCase().trim();
      const coincideBusqueda = !busquedaLower || 
        miembro.nombre.toLowerCase().includes(busquedaLower) ||
        miembro.apellido.toLowerCase().includes(busquedaLower) ||
        miembro.correo.toLowerCase().includes(busquedaLower);

      // Filtro de carrera
      const coincideCarrera = !this.carreraSeleccionada || 
        miembro.carrera === this.carreraSeleccionada;

      return coincideBusqueda && coincideCarrera;
    });

    console.log('🔧 Miembros filtrados:', this.miembrosFiltrados.length, 'de', this.miembros.length);
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.carreraSeleccionada = '';
    this.miembrosFiltrados = [...this.miembros];
  }

  calcularIniciales(nombre: string, apellido: string): string {
    const inicial1 = nombre ? nombre.charAt(0).toUpperCase() : '';
    const inicial2 = apellido ? apellido.charAt(0).toUpperCase() : '';
    return inicial1 + inicial2 || 'U';
  }
}
