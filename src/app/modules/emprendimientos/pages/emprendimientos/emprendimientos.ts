import { Component, OnInit } from '@angular/core';
import { EmprendimientosService } from '../../services/emprendimientos.service';
import { EventoConRelaciones, CreateEventoRequest } from '../../../eventos/models/evento.model';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-emprendimientos',
  standalone: false,
  templateUrl: './emprendimientos.html',
  styleUrl: './emprendimientos.css',
})
export class Emprendimientos implements OnInit {
  // Datos
  emprendimientos: EventoConRelaciones[] = [];
  cargando = false;

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 6;
  totalItems = 0;

  // Filtros
  filtros = {
    busqueda: '',
    modalidad: '',
    ordenarPor: 'recientes'
  };

  // Formulario
  mostrarFormulario = false;
  emprendimientoEditando: EventoConRelaciones | null = null;
  emprendimientoSeleccionado: EventoConRelaciones | null = null;

  nuevoEmprendimiento: CreateEventoRequest = {
    nombre: '',
    descripcion: '',
    fecha_evento: new Date().toISOString().split('T')[0], // Fecha actual por defecto (oculta)
    hora_evento: '00:00', // Hora por defecto (oculta)
    lugar: '',
    modalidad: ''
  };

  // Usuario actual
  usuarioActualId: number = 0;

  constructor(
    private emprendimientosService: EmprendimientosService,
    private alertService: AlertService
  ) {}

  async ngOnInit(): Promise<void> {
    this.usuarioActualId = parseInt(localStorage.getItem('userId') || '0');
    await this.cargarEmprendimientos();
  }

  async cargarEmprendimientos(): Promise<void> {
    this.cargando = true;
    try {
      this.emprendimientos = await this.emprendimientosService.obtenerEmprendimientos();
      this.totalItems = this.emprendimientos.length;
    } catch (error: any) {
      const mensaje = error.response?.data?.message || error.response?.data?.error || error.message || 'No se pudieron cargar los emprendimientos';
      
      if (error.response?.status !== 400 && error.response?.status !== 404) {
        this.alertService.error('Error', mensaje);
      }
    } finally {
      this.cargando = false;
    }
  }

  aplicarFiltros(): void {
    this.paginaActual = 1;
  }

  get emprendimientosFiltrados(): EventoConRelaciones[] {
    let emprendimientos = [...this.emprendimientos];

    // Filtro de búsqueda
    if (this.filtros.busqueda) {
      const busquedaLower = this.filtros.busqueda.toLowerCase();
      emprendimientos = emprendimientos.filter(e =>
        e.nombre.toLowerCase().includes(busquedaLower) ||
        e.descripcion?.toLowerCase().includes(busquedaLower) ||
        e.lugar?.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtro de modalidad
    if (this.filtros.modalidad) {
      emprendimientos = emprendimientos.filter(e => e.modalidad === this.filtros.modalidad);
    }

    // Ordenamiento
    emprendimientos = this.ordenarEmprendimientos(emprendimientos);

    return emprendimientos;
  }

  private ordenarEmprendimientos(emprendimientos: EventoConRelaciones[]): EventoConRelaciones[] {
    switch (this.filtros.ordenarPor) {
      case 'antiguos':
        return emprendimientos.sort((a, b) => 
          new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime()
        );
      case 'recientes':
        return emprendimientos.sort((a, b) => 
          new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime()
        );
      case 'nombre':
        return emprendimientos.sort((a, b) => 
          a.nombre.localeCompare(b.nombre)
        );
      default:
        return emprendimientos;
    }
  }

  get emprendimientosPaginados(): EventoConRelaciones[] {
    const filtrados = this.emprendimientosFiltrados;
    this.totalItems = filtrados.length;
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return filtrados.slice(inicio, fin);
  }

  onPaginaChange(pagina: number): void {
    this.paginaActual = pagina;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  limpiarFiltros(): void {
    this.filtros = {
      busqueda: '',
      modalidad: '',
      ordenarPor: 'recientes'
    };
    this.paginaActual = 1;
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.resetearFormulario();
    }
  }

  editarEmprendimiento(emprendimiento: EventoConRelaciones): void {
    this.emprendimientoEditando = emprendimiento;
    this.nuevoEmprendimiento = {
      nombre: emprendimiento.nombre,
      descripcion: emprendimiento.descripcion,
      fecha_evento: new Date().toISOString().split('T')[0], // Mantener fecha actual
      hora_evento: '00:00', // Hora por defecto
      lugar: emprendimiento.lugar || '',
      modalidad: emprendimiento.modalidad || ''
    };
    this.mostrarFormulario = true;
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.resetearFormulario();
  }

  async crearEmprendimiento(): Promise<void> {
    if (!this.validarFormulario()) {
      this.alertService.warning('Campos incompletos', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      await this.emprendimientosService.crearEmprendimiento(this.nuevoEmprendimiento);
      this.alertService.success('¡Emprendimiento creado!', 'El emprendimiento se ha publicado exitosamente');
      this.cancelarFormulario();
      await this.cargarEmprendimientos();
    } catch (error: any) {
      this.alertService.error('Error', error.response?.data?.message || 'No se pudo crear el emprendimiento');
    }
  }

  async actualizarEmprendimiento(): Promise<void> {
    if (!this.validarFormulario() || !this.emprendimientoEditando) {
      this.alertService.warning('Campos incompletos', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      await this.emprendimientosService.actualizarEmprendimiento(this.emprendimientoEditando.id_evento!, this.nuevoEmprendimiento);
      this.alertService.success('¡Emprendimiento actualizado!', 'El emprendimiento se ha actualizado exitosamente');
      this.cancelarFormulario();
      await this.cargarEmprendimientos();
    } catch (error: any) {
      this.alertService.error('Error', error.response?.data?.message || 'No se pudo actualizar el emprendimiento');
    }
  }

  async eliminarEmprendimiento(emprendimientoId: number): Promise<void> {
    if (!confirm('¿Estás seguro de que quieres eliminar este emprendimiento?')) {
      return;
    }

    try {
      await this.emprendimientosService.eliminarEmprendimiento(emprendimientoId);
      this.alertService.success('Emprendimiento eliminado', 'El emprendimiento se ha eliminado exitosamente');
      await this.cargarEmprendimientos();
    } catch (error: any) {
      this.alertService.error('Error', error.response?.data?.message || 'No se pudo eliminar el emprendimiento');
    }
  }

  private validarFormulario(): boolean {
    return !!(
      this.nuevoEmprendimiento.nombre &&
      this.nuevoEmprendimiento.descripcion
    );
  }

  private resetearFormulario(): void {
    this.emprendimientoEditando = null;
    this.nuevoEmprendimiento = {
      nombre: '',
      descripcion: '',
      fecha_evento: new Date().toISOString().split('T')[0],
      hora_evento: '00:00',
      lugar: '',
      modalidad: ''
    };
  }

  // Métodos para modal de detalle
  verDetalle(emprendimiento: EventoConRelaciones): void {
    this.emprendimientoSeleccionado = emprendimiento;
  }

  cerrarDetalle(): void {
    this.emprendimientoSeleccionado = null;
  }
}
