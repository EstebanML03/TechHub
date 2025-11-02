import { Component, OnInit } from '@angular/core';
import { EventosService } from '../../services/eventos.service';
import { Evento, CategoriaEvento, FiltroEventos } from '../../models/evento.model';
import { AlertService } from '../../../../shared/services/alert.service';
import { FilterService, FilterOptions, FilterResult } from '../../../../shared/services/filter.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-eventos',
  standalone: false,
  templateUrl: './eventos.html',
  styleUrl: './eventos.css',
})
export class Eventos implements OnInit {
  eventos$: Observable<Evento[]>;
  eventosOriginales: Evento[] = [];
  eventosFiltrados: Evento[] = [];
  eventosPaginados: Evento[] = [];
  categorias = Object.values(CategoriaEvento);

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 6;
  totalItems = 0;

  // Filtros
  filtro: FiltroEventos = {};
  filtrosActivos: FilterOptions = {};
  mostrarFormulario = false;

  nuevoEvento = {
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    ubicacion: '',
    categoria: CategoriaEvento.MEETUP,
    organizador: '',
    capacidadMaxima: 50,
    imagen: ''
  };

  constructor(
    private eventosService: EventosService,
    private alertService: AlertService,
    private filterService: FilterService
  ) {
    this.eventos$ = this.eventosService.getEventos();
  }

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.eventosService.getEventos().subscribe(eventos => {
      this.eventosOriginales = eventos;
      this.aplicarFiltrosYPaginacion();
    });
  }

  onFiltrosChange(filtros: FilterOptions): void {
    this.filtrosActivos = filtros;
    this.paginaActual = 1; // Reset a primera página cuando cambian filtros
    this.aplicarFiltrosYPaginacion();
  }

  onPaginaChange(pagina: number): void {
    this.paginaActual = pagina;
    this.aplicarFiltrosYPaginacion();
    // Scroll al inicio de la lista
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private aplicarFiltrosYPaginacion(): void {
    const resultado: FilterResult<Evento> = this.filterService.filterAndSort(
      this.eventosOriginales,
      this.filtrosActivos,
      {
        page: this.paginaActual,
        itemsPerPage: this.itemsPorPagina
      }
    );

    this.eventosPaginados = resultado.items;
    this.totalItems = resultado.total;
  }

  aplicarFiltros(): void {
    this.eventos$ = this.eventosService.filtrarEventos(this.filtro);
  }

  limpiarFiltros(): void {
    this.filtro = {};
    this.aplicarFiltros();
  }

  toggleLike(eventoId: string): void {
    this.eventosService.toggleLike(eventoId);
  }

  inscribirse(eventoId: string): void {
    const exito = this.eventosService.inscribirseEvento(eventoId);
    if (exito) {
      this.alertService.success('¡Inscripción exitosa!', 'Te has inscrito al evento exitosamente');
    } else {
      this.alertService.error('No se pudo inscribir', 'El evento puede estar lleno o ya estás inscrito');
    }
  }

  desinscribirse(eventoId: string): void {
    const exito = this.eventosService.desinscribirseEvento(eventoId);
    if (exito) {
      this.alertService.success('Desinscripción exitosa', 'Te has desinscrito del evento');
    }
  }

  estaInscrito(eventoId: string): boolean {
    return this.eventosService.estaInscrito(eventoId);
  }

  tieneLike(eventoId: string): boolean {
    return this.eventosService.tieneLike(eventoId);
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.resetearFormulario();
    }
  }

  crearEvento(): void {
    if (!this.validarFormulario()) {
      this.alertService.warning('Campos incompletos', 'Por favor completa todos los campos obligatorios');
      return;
    }

    this.eventosService.crearEvento({
      titulo: this.nuevoEvento.titulo,
      descripcion: this.nuevoEvento.descripcion,
      fecha: new Date(this.nuevoEvento.fecha),
      hora: this.nuevoEvento.hora,
      ubicacion: this.nuevoEvento.ubicacion,
      categoria: this.nuevoEvento.categoria,
      organizador: this.nuevoEvento.organizador,
      capacidadMaxima: this.nuevoEvento.capacidadMaxima,
      imagen: this.nuevoEvento.imagen || `https://picsum.photos/seed/${Date.now()}/400/250`
    });

    this.alertService.success('¡Evento creado!', 'El evento se ha creado exitosamente');
    this.toggleFormulario();
  }

  private validarFormulario(): boolean {
    return !!(
      this.nuevoEvento.titulo &&
      this.nuevoEvento.descripcion &&
      this.nuevoEvento.fecha &&
      this.nuevoEvento.hora &&
      this.nuevoEvento.ubicacion &&
      this.nuevoEvento.organizador
    );
  }

  private resetearFormulario(): void {
    this.nuevoEvento = {
      titulo: '',
      descripcion: '',
      fecha: '',
      hora: '',
      ubicacion: '',
      categoria: CategoriaEvento.MEETUP,
      organizador: '',
      capacidadMaxima: 50,
      imagen: ''
    };
  }

  getLugaresDisponibles(evento: Evento): number {
    return evento.capacidadMaxima - evento.inscritos.length;
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
