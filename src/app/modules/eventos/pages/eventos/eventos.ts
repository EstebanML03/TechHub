import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { EventosService } from '../../services/eventos.service';
import { CategoriasService } from '../../services/categorias.service';
import { EventoConRelaciones, CreateEventoRequest, Categoria } from '../../models/evento.model';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-eventos',
  standalone: false,
  templateUrl: './eventos.html',
  styleUrl: './eventos.css',
  animations: [
    trigger('slideDown', [
      state('collapsed', style({
        height: '0',
        overflow: 'hidden',
        opacity: '0',
        paddingTop: '0',
        paddingBottom: '0'
      })),
      state('expanded', style({
        height: '*',
        overflow: 'visible',
        opacity: '1',
        paddingTop: '*',
        paddingBottom: '*'
      })),
      transition('collapsed <=> expanded', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class Eventos implements OnInit {
  // Datos
  eventos: EventoConRelaciones[] = [];
  eventosInscritos: EventoConRelaciones[] = [];
  categoriasDisponibles: Categoria[] = [];
  cargando = false;

  // Vista activa
  vistaActual: 'todos' | 'inscritos' = 'todos';

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 6;
  totalItems = 0;

  // Filtros
  busqueda = '';
  modalidadFiltro = '';
  fechaFiltro = ''; // 'proximos', 'esta-semana', 'este-mes', 'pasados'
  estadoFiltro = ''; // 'disponible', 'finalizado'
  categoriaFiltro = ''; // ID de categoría seleccionada para filtrar
  ordenamiento = 'fecha-asc'; // 'fecha-asc', 'fecha-desc', 'nombre-asc', 'inscritos-desc'
  filtrosExpandidos = false; // Controla el desplegable de filtros

  // Formulario
  mostrarFormulario = false;
  editandoEvento: EventoConRelaciones | null = null;

  nuevoEvento: CreateEventoRequest = {
    nombre: '',
    descripcion: '',
    fecha_evento: '',
    hora_evento: '',
    lugar: '',
    modalidad: 'presencial'
  };

  constructor(
    private eventosService: EventosService,
    private categoriasService: CategoriasService,
    private alertService: AlertService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarCategorias();
    await this.cargarEventos();
  }

  async cargarCategorias(): Promise<void> {
    try {
      const todasCategorias = await this.categoriasService.obtenerCategorias();
      // Excluir la categoría "Emprendimiento" (id_categoria = 9)
      this.categoriasDisponibles = todasCategorias.filter(cat => cat.id_categoria !== 9);
    } catch (error: any) {
      // No mostrar error si el endpoint no existe
      if (error.response?.status !== 404 && error.response?.status !== 400) {
        this.alertService.warning('Categorías no disponibles', 'No se pudieron cargar las categorías');
      }
    }
  }

  async cargarEventos(): Promise<void> {
    this.cargando = true;
    try {
      switch (this.vistaActual) {
        case 'todos':
          this.eventos = await this.eventosService.obtenerEventos();
          this.totalItems = this.eventos.length;
          break;
        case 'inscritos':
          this.eventosInscritos = await this.eventosService.obtenerEventosInscritos();
          this.totalItems = this.eventosInscritos.length;
          break;
      }
    } catch (error: any) {
      const mensaje = error.response?.data?.message || error.response?.data?.error || error.message || 'No se pudieron cargar los eventos';
      
      // Solo mostrar error si no es 400/404 (endpoints no implementados)
      if (error.response?.status !== 400 && error.response?.status !== 404) {
        this.alertService.error('Error', mensaje);
      }
    } finally {
      this.cargando = false;
    }
  }

  get eventosFiltrados(): EventoConRelaciones[] {
    let eventos: EventoConRelaciones[] = [];
    
    switch (this.vistaActual) {
      case 'todos':
        eventos = this.eventos;
        break;
      case 'inscritos':
        eventos = this.eventosInscritos;
        break;
    }

    // Filtro de búsqueda
    if (this.busqueda) {
      const busquedaLower = this.busqueda.toLowerCase();
      eventos = eventos.filter(e =>
        e.nombre.toLowerCase().includes(busquedaLower) ||
        e.descripcion?.toLowerCase().includes(busquedaLower) ||
        e.lugar?.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtro de modalidad
    if (this.modalidadFiltro) {
      eventos = eventos.filter(e => e.modalidad === this.modalidadFiltro);
    }

    // Filtro de fecha
    if (this.fechaFiltro) {
      const ahora = new Date();
      ahora.setHours(0, 0, 0, 0);
      
      eventos = eventos.filter(e => {
        const fechaEvento = new Date(e.fecha_evento);
        fechaEvento.setHours(0, 0, 0, 0);
        
        switch (this.fechaFiltro) {
          case 'proximos':
            return fechaEvento >= ahora;
          case 'esta-semana':
            const finSemana = new Date(ahora);
            finSemana.setDate(ahora.getDate() + 7);
            return fechaEvento >= ahora && fechaEvento <= finSemana;
          case 'este-mes':
            const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
            return fechaEvento >= ahora && fechaEvento <= finMes;
          case 'pasados':
            return fechaEvento < ahora;
          default:
            return true;
        }
      });
    }

    // Filtro de estado
    if (this.estadoFiltro) {
      const ahora = new Date();
      ahora.setHours(0, 0, 0, 0);
      
      eventos = eventos.filter(e => {
        const fechaEvento = new Date(e.fecha_evento);
        fechaEvento.setHours(0, 0, 0, 0);
        const esPasado = fechaEvento < ahora;
        
        if (this.estadoFiltro === 'disponible') {
          return !esPasado;
        } else if (this.estadoFiltro === 'finalizado') {
          return esPasado;
        }
        return true;
      });
    }

    // Filtro de categoría
    if (this.categoriaFiltro) {
      eventos = eventos.filter(e => 
        e.id_categoria?.toString() === this.categoriaFiltro
      );
    }

    // Ordenamiento
    eventos = this.ordenarEventos([...eventos]);

    return eventos;
  }

  private ordenarEventos(eventos: EventoConRelaciones[]): EventoConRelaciones[] {
    switch (this.ordenamiento) {
      case 'fecha-asc':
        return eventos.sort((a, b) => 
          new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime()
        );
      case 'fecha-desc':
        return eventos.sort((a, b) => 
          new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime()
        );
      case 'nombre-asc':
        return eventos.sort((a, b) => 
          a.nombre.localeCompare(b.nombre)
        );
      case 'nombre-desc':
        return eventos.sort((a, b) => 
          b.nombre.localeCompare(a.nombre)
        );
      case 'inscritos-desc':
        return eventos.sort((a, b) => 
          (b.total_inscritos || b.inscritos?.length || 0) - 
          (a.total_inscritos || a.inscritos?.length || 0)
        );
      case 'inscritos-asc':
        return eventos.sort((a, b) => 
          (a.total_inscritos || a.inscritos?.length || 0) - 
          (b.total_inscritos || b.inscritos?.length || 0)
        );
      default:
        return eventos;
    }
  }

  get eventosPaginados(): EventoConRelaciones[] {
    const filtrados = this.eventosFiltrados;
    this.totalItems = filtrados.length; // Actualizar total para paginación
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return filtrados.slice(inicio, fin);
  }

  cambiarVista(vista: 'todos' | 'inscritos'): void {
    this.vistaActual = vista;
    this.paginaActual = 1;
    this.cargarEventos();
  }

  onPaginaChange(pagina: number): void {
    this.paginaActual = pagina;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.modalidadFiltro = '';
    this.fechaFiltro = '';
    this.estadoFiltro = '';
    this.categoriaFiltro = '';
    this.ordenamiento = 'fecha-asc';
    this.paginaActual = 1;
    // Contraer filtros después de limpiar
    this.filtrosExpandidos = false;
  }

  async inscribirse(eventoId: number): Promise<void> {
    try {
      await this.eventosService.inscribirseEvento(eventoId);
      this.alertService.success('¡Inscripción exitosa!', 'Te has inscrito al evento exitosamente');
      await this.cargarEventos();
    } catch (error: any) {
      const mensaje = error.message || error.response?.data?.message || 'No se pudo inscribir al evento';
      
      // Si ya está inscrito, mostrar mensaje informativo en lugar de error
      if (mensaje.includes('Ya estás inscrito')) {
        this.alertService.info('Ya inscrito', mensaje);
      } else {
        this.alertService.error('Error', mensaje);
      }
    }
  }

  async desinscribirse(eventoId: number): Promise<void> {
    try {
      await this.eventosService.cancelarInscripcion(eventoId);
      this.alertService.success('Desinscripción exitosa', 'Te has desinscrito del evento');
      await this.cargarEventos();
    } catch (error: any) {
      this.alertService.error('Error', error.response?.data?.message || 'No se pudo desinscribir del evento');
    }
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.resetearFormulario();
    }
  }

  editarEvento(evento: EventoConRelaciones): void {
    this.editandoEvento = evento;
    this.nuevoEvento = {
      nombre: evento.nombre,
      descripcion: evento.descripcion,
      fecha_evento: evento.fecha_evento.toString().split('T')[0],
      hora_evento: evento.hora_evento,
      lugar: evento.lugar,
      modalidad: evento.modalidad,
      id_categoria: evento.id_categoria
    };
    this.mostrarFormulario = true;
  }

  async crearEvento(): Promise<void> {
    if (!this.validarFormulario()) {
      this.alertService.warning('Campos incompletos', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      if (this.editandoEvento) {
        await this.eventosService.actualizarEvento(this.editandoEvento.id_evento!, this.nuevoEvento);
        this.alertService.success('¡Evento actualizado!', 'El evento se ha actualizado exitosamente');
      } else {
        await this.eventosService.crearEvento(this.nuevoEvento);
        this.alertService.success('¡Evento creado!', 'El evento se ha creado exitosamente');
      }
      
      this.toggleFormulario();
      await this.cargarEventos();
    } catch (error: any) {
      this.alertService.error('Error', error.response?.data?.message || 'No se pudo guardar el evento');
    }
  }

  async eliminarEvento(eventoId: number): Promise<void> {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      return;
    }

    try {
      await this.eventosService.eliminarEvento(eventoId);
      this.alertService.success('Evento eliminado', 'El evento se ha eliminado exitosamente');
      await this.cargarEventos();
    } catch (error: any) {
      this.alertService.error('Error', error.response?.data?.message || 'No se pudo eliminar el evento');
    }
  }

  private validarFormulario(): boolean {
    return !!(
      this.nuevoEvento.nombre &&
      this.nuevoEvento.fecha_evento
    );
  }

  private resetearFormulario(): void {
    this.editandoEvento = null;
    this.nuevoEvento = {
      nombre: '',
      descripcion: '',
      fecha_evento: '',
      hora_evento: '',
      lugar: '',
      modalidad: 'presencial'
    };
  }

  esOrganizador(evento: EventoConRelaciones): boolean {
    const userId = parseInt(localStorage.getItem('userId') || '0');
    return this.eventosService.esOrganizador(evento, userId);
  }

  esAdmin(): boolean {
    const rol = parseInt(localStorage.getItem('rol') || '0');
    return rol === 1;
  }

  getModalidadBadge(modalidad?: string): { color: string; label: string } {
    return this.eventosService.getModalidadBadge(modalidad);
  }

  formatearFecha(fecha: Date | string): string {
    return this.eventosService.formatearFecha(fecha);
  }

  eventoPasado(fecha: Date | string): boolean {
    return this.eventosService.eventoPasado(fecha);
  }

  get filtrosActivos(): number {
    let count = 0;
    if (this.busqueda) count++;
    if (this.modalidadFiltro) count++;
    if (this.fechaFiltro) count++;
    if (this.estadoFiltro) count++;
    if (this.categoriaFiltro) count++;
    return count;
  }

  get tieneResultados(): boolean {
    return this.eventosFiltrados.length > 0;
  }

  toggleFiltros(): void {
    this.filtrosExpandidos = !this.filtrosExpandidos;
  }
}
