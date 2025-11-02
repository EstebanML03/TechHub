import { Component, OnInit } from '@angular/core';
import { EmprendimientosService } from '../../services/emprendimientos.service';
import {
  Emprendimiento,
  CategoriaEmprendimiento,
  EtapaEmprendimiento,
  FiltroEmprendimientos
} from '../../models/emprendimiento.model';
import { AlertService } from '../../../../shared/services/alert.service';
import { FilterService, FilterOptions, FilterResult } from '../../../../shared/services/filter.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-emprendimientos',
  standalone: false,
  templateUrl: './emprendimientos.html',
  styleUrl: './emprendimientos.css',
})
export class Emprendimientos implements OnInit {
  emprendimientos$: Observable<Emprendimiento[]>;
  emprendimientosOriginales: Emprendimiento[] = [];
  emprendimientosPaginados: Emprendimiento[] = [];
  categorias = Object.values(CategoriaEmprendimiento);
  etapas = Object.values(EtapaEmprendimiento);

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 6;
  totalItems = 0;

  // Filtros
  filtrosActivos: FilterOptions = {};
  filtro: FiltroEmprendimientos = {};
  mostrarFormulario = false;
  emprendimientoSeleccionado: Emprendimiento | null = null;

  nuevoEmprendimiento = {
    nombre: '',
    descripcion: '',
    categoria: CategoriaEmprendimiento.TECNOLOGIA,
    etapa: EtapaEmprendimiento.IDEA,
    descripcionDetallada: '',
    problema: '',
    solucion: '',
    mercadoObjetivo: '',
    propuestaValor: '',
    equipoRequerido: '',
    tecnologias: '',
    buscoInversion: false,
    montoInversion: 0,
    buscoColaboradores: false,
    website: '',
    email: '',
    telefono: '',
    imagen: ''
  };

  constructor(
    private emprendimientosService: EmprendimientosService,
    private alertService: AlertService,
    private filterService: FilterService
  ) {
    this.emprendimientos$ = this.emprendimientosService.getEmprendimientos();
  }

  ngOnInit(): void {
    this.cargarEmprendimientos();
  }

  cargarEmprendimientos(): void {
    this.emprendimientosService.getEmprendimientos().subscribe(emprendimientos => {
      this.emprendimientosOriginales = emprendimientos;
      this.aplicarFiltrosYPaginacion();
    });
  }

  onFiltrosChange(filtros: FilterOptions): void {
    this.filtrosActivos = filtros;
    this.paginaActual = 1;
    this.aplicarFiltrosYPaginacion();
  }

  onPaginaChange(pagina: number): void {
    this.paginaActual = pagina;
    this.aplicarFiltrosYPaginacion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private aplicarFiltrosYPaginacion(): void {
    const resultado: FilterResult<Emprendimiento> = this.filterService.filterAndSort(
      this.emprendimientosOriginales,
      this.filtrosActivos,
      {
        page: this.paginaActual,
        itemsPerPage: this.itemsPorPagina
      }
    );

    this.emprendimientosPaginados = resultado.items;
    this.totalItems = resultado.total;
  }

  aplicarFiltros(): void {
    this.emprendimientos$ = this.emprendimientosService.filtrarEmprendimientos(this.filtro);
  }

  limpiarFiltros(): void {
    this.filtro = {};
    this.aplicarFiltros();
  }

  toggleLike(emprendimientoId: string): void {
    this.emprendimientosService.toggleLike(emprendimientoId);
  }

  tieneLike(emprendimientoId: string): boolean {
    return this.emprendimientosService.tieneLike(emprendimientoId);
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.resetearFormulario();
    }
  }

  verDetalle(emprendimiento: Emprendimiento): void {
    this.emprendimientoSeleccionado = emprendimiento;
    this.emprendimientosService.incrementarVistas(emprendimiento.id);
  }

  cerrarDetalle(): void {
    this.emprendimientoSeleccionado = null;
  }

  crearEmprendimiento(): void {
    if (!this.validarFormulario()) {
      this.alertService.warning('Campos incompletos', 'Por favor completa todos los campos obligatorios');
      return;
    }

    this.emprendimientosService.crearEmprendimiento({
      nombre: this.nuevoEmprendimiento.nombre,
      descripcion: this.nuevoEmprendimiento.descripcion,
      categoria: this.nuevoEmprendimiento.categoria,
      etapa: this.nuevoEmprendimiento.etapa,
      creador: {
        id: 'user-1',
        nombre: 'Usuario Actual',
        avatar: '👨‍💻',
        email: this.nuevoEmprendimiento.email || 'user@example.com'
      },
      descripcionDetallada: this.nuevoEmprendimiento.descripcionDetallada,
      problema: this.nuevoEmprendimiento.problema,
      solucion: this.nuevoEmprendimiento.solucion,
      mercadoObjetivo: this.nuevoEmprendimiento.mercadoObjetivo,
      propuestaValor: this.nuevoEmprendimiento.propuestaValor,
      equipoRequerido: this.nuevoEmprendimiento.equipoRequerido.split(',').map(s => s.trim()).filter(s => s),
      tecnologias: this.nuevoEmprendimiento.tecnologias.split(',').map(s => s.trim()).filter(s => s),
      buscoInversion: this.nuevoEmprendimiento.buscoInversion,
      montoInversion: this.nuevoEmprendimiento.buscoInversion ? this.nuevoEmprendimiento.montoInversion : undefined,
      buscoColaboradores: this.nuevoEmprendimiento.buscoColaboradores,
      website: this.nuevoEmprendimiento.website || undefined,
      email: this.nuevoEmprendimiento.email || undefined,
      telefono: this.nuevoEmprendimiento.telefono || undefined,
      imagen: this.nuevoEmprendimiento.imagen || `https://picsum.photos/seed/${Date.now()}/600/400`
    });

    this.alertService.success('¡Emprendimiento creado!', 'Tu emprendimiento se ha publicado exitosamente');
    this.toggleFormulario();
  }

  private validarFormulario(): boolean {
    return !!(
      this.nuevoEmprendimiento.nombre &&
      this.nuevoEmprendimiento.descripcion &&
      this.nuevoEmprendimiento.descripcionDetallada &&
      this.nuevoEmprendimiento.problema &&
      this.nuevoEmprendimiento.solucion &&
      this.nuevoEmprendimiento.mercadoObjetivo &&
      this.nuevoEmprendimiento.propuestaValor
    );
  }

  private resetearFormulario(): void {
    this.nuevoEmprendimiento = {
      nombre: '',
      descripcion: '',
      categoria: CategoriaEmprendimiento.TECNOLOGIA,
      etapa: EtapaEmprendimiento.IDEA,
      descripcionDetallada: '',
      problema: '',
      solucion: '',
      mercadoObjetivo: '',
      propuestaValor: '',
      equipoRequerido: '',
      tecnologias: '',
      buscoInversion: false,
      montoInversion: 0,
      buscoColaboradores: false,
      website: '',
      email: '',
      telefono: '',
      imagen: ''
    };
  }

  getEtapaBadgeClass(etapa: EtapaEmprendimiento): string {
    const classes: Record<EtapaEmprendimiento, string> = {
      [EtapaEmprendimiento.IDEA]: 'badge-idea',
      [EtapaEmprendimiento.VALIDACION]: 'badge-validacion',
      [EtapaEmprendimiento.MVP]: 'badge-mvp',
      [EtapaEmprendimiento.TRACCION]: 'badge-traccion',
      [EtapaEmprendimiento.CRECIMIENTO]: 'badge-crecimiento',
      [EtapaEmprendimiento.ESCALAMIENTO]: 'badge-escalamiento'
    };
    return classes[etapa] || '';
  }
}
